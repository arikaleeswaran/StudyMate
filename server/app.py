import os
import requests
import re
from bs4 import BeautifulSoup
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity

# Load environment variables
load_dotenv()

# --- App & Database Configuration ---
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
db = SQLAlchemy(app)

# --- API Keys & Clients (Unchanged) ---
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# --- Database Models (Unchanged) ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Resource(db.Model):
    __tablename__ = 'resources'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(500), unique=True, nullable=False)
    source = db.Column(db.String(100))
    thumbnail_url = db.Column(db.String(500), nullable=True)

class SavedResource(db.Model):
    __tablename__ = 'saved_resources'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey('resources.id'), nullable=False)


# --- Helper Functions (Unchanged) ---
# ... (get_youtube_videos, scrape_duckduckgo_articles, scrape_duckduckgo_documents are still here)
def get_youtube_videos(topic, max_results=12):
    search_request = youtube.search().list(q=topic, part='snippet', type='video', maxResults=max_results, relevanceLanguage='en', videoCategoryId='27')
    search_response = search_request.execute()
    video_ids = [item['id']['videoId'] for item in search_response.get('items', [])]
    if not video_ids:
        return []
    video_details_request = youtube.videos().list(part='snippet,contentDetails', id=','.join(video_ids))
    video_details_response = video_details_request.execute()
    videos = []
    for item in video_details_response.get('items', []):
        duration_str = item['contentDetails']['duration']
        match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
        if match:
            hours = int(match.group(1)) if match.group(1) else 0
            minutes = int(match.group(2)) if match.group(2) else 0
            seconds = int(match.group(3)) if match.group(3) else 0
            total_seconds = hours * 3600 + minutes * 60 + seconds
            if total_seconds > 70:
                videos.append({
                    "type": "video", "source": "YouTube", "title": item['snippet']['title'],
                    "url": f"https://www.youtube.com/watch?v={item['id']}",
                    "thumbnail": item['snippet']['thumbnails']['high']['url']
                })
    return videos

def scrape_duckduckgo_articles(topic, max_results=12):
    url = f"https://html.duckduckgo.com/html/?q={topic}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        articles = []
        for item in soup.find_all('div', class_='result', limit=max_results):
            title_element = item.find('a', class_='result__a')
            snippet_element = item.find('a', class_='result__snippet')
            if title_element and snippet_element:
                title = title_element.text
                link = title_element['href']
                snippet = snippet_element.text
                source = link.split('/')[2].replace('www.', '')
                articles.append({
                    "type": "article", "source": source, "title": title,
                    "url": link, "snippet": snippet
                })
        return articles
    except requests.exceptions.RequestException as e:
        print(f"Error scraping DuckDuckGo: {e}")
        return []

def scrape_duckduckgo_documents(topic, max_results=12):
    search_query = f"{topic} filetype:pdf"
    url = f"https://html.duckduckgo.com/html/?q={search_query}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        documents = []
        for item in soup.find_all('div', class_='result', limit=max_results):
            title_element = item.find('a', class_='result__a')
            snippet_element = item.find('a', class_='result__snippet')
            if title_element and snippet_element:
                title = title_element.text
                link = title_element['href']
                source = link.split('/')[2].replace('www.', '')
                documents.append({
                    "type": "document", "source": source, "title": title,
                    "url": link, "snippet": snippet_element.text
                })
        return documents
    except requests.exceptions.RequestException as e:
        print(f"Error scraping documents: {e}")
        return []

# --- API Endpoints ---
@app.route('/api/search')
def search_api():
    topic = request.args.get('topic')
    if not topic:
        return jsonify({"error": "A 'topic' parameter is required."}), 400
    youtube_videos = []
    try:
        youtube_videos = get_youtube_videos(topic)
    except Exception as e:
        print(f"Error fetching YouTube videos: {e}")
    web_articles = []
    try:
        web_articles = scrape_duckduckgo_articles(topic)
    except Exception as e:
        print(f"Error fetching web articles: {e}")
    pdf_documents = []
    try:
        pdf_documents = scrape_duckduckgo_documents(topic)
    except Exception as e:
        print(f"Error fetching documents: {e}")
    results = { "videos": youtube_videos, "articles": web_articles, "documents": pdf_documents }
    return jsonify(results)

@app.route('/')
def home():
    return "Hello, the StudyMateHub server is running!"

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        # --- THE FIX: Convert user.id to a string here ---
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token)
    
    return jsonify({"error": "Invalid credentials"}), 401


@app.route('/api/save-resource', methods=['POST'])
@jwt_required()
def save_resource():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    resource = Resource.query.filter_by(url=data['url']).first()
    if not resource:
        resource = Resource(
            title=data['title'],
            url=data['url'],
            type=data['type'],
            source=data.get('source'),
            thumbnail_url=data.get('thumbnail')
        )
        db.session.add(resource)
        db.session.commit()
    already_saved = SavedResource.query.filter_by(user_id=current_user_id, resource_id=resource.id).first()
    if already_saved:
        return jsonify({"message": "Resource already saved"}), 200
    new_saved_item = SavedResource(user_id=current_user_id, resource_id=resource.id)
    db.session.add(new_saved_item)
    db.session.commit()
    return jsonify({"message": "Resource saved successfully"}), 201

@app.route('/api/my-roadmap')
@jwt_required()
def get_my_roadmap():
    current_user_id = get_jwt_identity()
    saved_items = db.session.query(Resource).join(SavedResource).filter(SavedResource.user_id == current_user_id).all()
    roadmap = [
        {
            "id": item.id, "title": item.title, "url": item.url,
            "type": item.type, "source": item.source, "thumbnail": item.thumbnail_url
        } for item in saved_items
    ]
    return jsonify(roadmap)

# --- Main execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)