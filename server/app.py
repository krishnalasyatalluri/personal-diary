from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import bcrypt
import jwt
import os
import certifi
from bson import ObjectId 
import pymongo
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})



mongo_url = "mongodb+srv://krishnalasyatalluri9:lasya0425@personaldiary.gpxph.mongodb.net/?retryWrites=true&w=majority&appName=personaldiary"

try:
    client = MongoClient(mongo_url, tlsCAFile=certifi.where(), socketTimeoutMS=30000, connectTimeoutMS=30000)
    db = client['personaldiary']  
    client.admin.command('ping')
    print("Database connected successfully.")
except Exception as e:
    print(f"Failed to connect to the database. Error: {e}")
@app.after_request
def after_request(response):
    return response

def create_user(username, email, password_hash):
    user_id = db.users.insert_one({
        'username': username,
        'email': email,
        'password_hash': password_hash
    }).inserted_id  
    return str(user_id)  
diary_entries = []
class DiaryEntry :
    def __init__(self,user_id,entry_id,date,title,content,tags,mood):
        self.user_id=user_id
        self.entry_id=entry_id
        self.date = date
        self.title = title
        self.content = content
        self.tags = tags
        self.mood = mood
    def to_dict(self):
        return {
            'user_id':self.user_id,
            'entry_id': self.entry_id,
            'date': self.date,
            'title': self.title,
            'content': self.content,
            'tags': self.tags,
            'mood': self.mood
        }


@app.route('/')
def home():
    return "Hello"

@app.route('/user/register', methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data['username']
        email = data['email']
        password = data['password']
        if not username or not email or not password:
            return jsonify({"error": "All fields required"}), 400
        if db.users.find_one({'email': email}):
            return jsonify({"error": "User already exists"}), 400
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_id = create_user(username, email, password_hash)
        return jsonify({"message": "User created successfully", "user_id": user_id}), 201  # Return the user ID
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({"error": "All fields required"}), 400
        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"Error": "Invalid email or password"}), 401
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
            token = jwt.encode({
                'user_id': str(user['_id']),  # Use the user ID in the JWT payload
                'exp': datetime.utcnow() + timedelta(hours=1)
            }, 'python', algorithm='HS256')

            return jsonify({"message": "Login successful", "token": token}), 200
        return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#diary entries
def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return None
    try:
        decoded = jwt.decode(token, 'python', algorithms=['HS256'])
        user_id = decoded.get('user_id')
        return db.users.find_one({'_id': ObjectId(user_id)})
    except:
        return None
# @app.route('/diary/entries', methods=['GET'])
# def get_entries():
#     try:
#         entries = list(db.diary_entries.find())
#         for entry in entries:
#             entry['_id'] = str(entry['_id'])
#         return jsonify({"entries": entries}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
@app.route('/diary/entries', methods=['GET'])
def get_entries():
    try:
        # Extract the token from the request headers
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401
        
        # Decode the token to get the user ID
        token = token.split()[1]  # Assuming the token is in the format 'Bearer <token>'
        decoded = jwt.decode(token, 'python', algorithms=['HS256'])
        user_id = decoded.get('user_id')

        # Fetch entries for the authenticated user
        entries = list(db.diary_entries.find({"user_id": user_id}))
        for entry in entries:
            entry['_id'] = str(entry['_id'])  # Convert ObjectId to string
        
        return jsonify({"entries": entries}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
VALID_MOODS = {"Sad", "Happy", "Neutral"}
@app.route('/diary/new-entry', methods=['POST'])
def add_entry():
    try:
        token = request.headers.get('Authorization').split()[1]
        data = jwt.decode(token, 'python', algorithms=['HS256'])
        user_id = data['user_id']

        entry_data = request.get_json()
        mood = entry_data['mood']
        date = entry_data.get('date')
        if mood not in VALID_MOODS:
            return jsonify({"error": f"Invalid mood. Valid values are {', '.join(VALID_MOODS)}"}), 400
        try:
            # Ensure date format is YYYY-MM-DD
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        new_entry = DiaryEntry(
            user_id=user_id,
            entry_id=str(ObjectId()),  
            date=date,
            title=entry_data['title'],
            content=entry_data['content'],
            tags=entry_data['tags'],
            mood=mood
        )
        result = db.diary_entries.insert_one(new_entry.to_dict())
        created_entry = db.diary_entries.find_one({"_id": result.inserted_id})
        if created_entry:
            created_entry['_id'] = str(created_entry['_id'])  

        return jsonify({
            "message": "Diary entry created successfully",
            "entry": created_entry
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/diary/update-entry/<entry_id>', methods=['PUT'])
def update_entry(entry_id):
    try:
        # Extract and verify the token from Authorization header
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token missing"}), 401
        
        token = token.split()[1]  # Assuming token is in 'Bearer <token>' format
        decoded = jwt.decode(token,'python', algorithms=['HS256'])
        user_id = decoded.get('user_id')

        # Get the entry data from the request
        entry_data = request.get_json()
        if not entry_data:
            return jsonify({"error": "Invalid data format"}), 400

        mood = entry_data.get('mood', None)
        if mood and mood not in ["Sad", "Happy", "Neutral"]:
            return jsonify({"error": "Invalid mood. Valid values are Sad, Happy, Neutral."}), 400
        
        # Prepare the updated entry data
        updated_entry = {}
        if 'title' in entry_data:
            updated_entry['title'] = entry_data['title']
        if 'content' in entry_data:
            updated_entry['content'] = entry_data['content']
        if 'tags' in entry_data:
            updated_entry['tags'] = entry_data['tags']
        if 'mood' in entry_data:
            updated_entry['mood'] = mood

        # Always update the date
        updated_entry["date"] = datetime.now().strftime('%Y-%m-%d')

        # Update the entry in the database
        result = db.diary_entries.update_one(
            {"_id": ObjectId(entry_id), "user_id": user_id},  # Ensure the user owns the entry
            {"$set": updated_entry}
        )

        if result.matched_count:
            # Fetch and return the updated entry
            entry = db.diary_entries.find_one({"_id": ObjectId(entry_id)})
            if entry:
                entry['_id'] = str(entry['_id'])
            return jsonify({"message": "Diary entry updated successfully", "entry": entry}), 200

        return jsonify({"error": "Entry not found or user unauthorized"}), 404

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500










@app.route('/diary/delete-entry/<entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    try:
        token = request.headers.get('Authorization').split()[1]
        data = jwt.decode(token, 'python', algorithms=['HS256'])
        user_id = data['user_id']

        result = db.diary_entries.delete_one({"_id": ObjectId(entry_id), "user_id": user_id})


        if result.deleted_count:
            return jsonify({"message": "Diary entry deleted successfully"}), 200
        return jsonify({"error": "Entry not found or user unauthorized"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @app.route('/diary/entries/date/<start_date>/<end_date>', methods=['GET'])
# def get_entries_by_date(start_date, end_date):
#     try:
#         # Validate date format
#         try:
#             datetime.strptime(start_date, '%Y-%m-%d')
#             datetime.strptime(end_date, '%Y-%m-%d')
#         except ValueError:
#             return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

#         # Get the sort order from query parameters, default to 'asc'
#         sort_order = request.args.get('sort', 'asc')
        
#         # Validate sort order
#         if sort_order not in ['asc', 'desc']:
#             return jsonify({"error": "Invalid sort order. Use 'asc' or 'desc'."}), 400

#         # Set sort direction based on the query parameter
#         sort_direction = 1 if sort_order == 'asc' else -1

#         # Query the database
#         entries = list(db.diary_entries.find({
#             "date": {"$gte": start_date, "$lte": end_date}
#         }).sort("date", sort_direction))

#         # Convert ObjectId to string
#         for entry in entries:
#             entry['_id'] = str(entry['_id'])
        
#         if not entries:
#             return jsonify({"message": "No entries found for the selected date range."}), 200

#         return jsonify({"entries": entries}), 200

#     except Exception as e:
#         print(f"Error in get_entries_by_date: {e}")  # Log the error for debugging
#         return jsonify({"error": str(e)}), 500




@app.route('/diary/entries/tags', methods=['GET'])
def get_entries_by_tags():
    try:
        tags = request.args.getlist('tag')
        if not tags:
            return jsonify({"error": "No tags provided"}), 400

        entries = list(db.diary_entries.find({"tags": {"$in": tags}}))
        for entry in entries:
            entry['_id'] = str(entry['_id'])
        return jsonify({"entries": entries}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/diary/entries/mood/<mood>', methods=['GET'])
def get_entries_by_mood(mood):
    try:
        # Extract token from headers for authorization
        token = request.headers.get('Authorization').split()[1]  # Assuming 'Bearer <token>'
        
        # Decode the token to extract the user_id
        decoded = jwt.decode(token, 'python', algorithms=['HS256'])
        user_id = decoded.get('user_id')

        # Validate mood
        if mood not in VALID_MOODS:
            return jsonify({"error": f"Invalid mood. Valid values are {', '.join(VALID_MOODS)}"}), 400

        # Fetch entries based on user_id and mood
        entries = list(db.diary_entries.find({"user_id": user_id, "mood": mood}))
        
        # Convert ObjectId to string for each entry
        for entry in entries:
            entry['_id'] = str(entry['_id'])

        return jsonify({"entries": entries}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/diary/entries/date/<start_date>/<end_date>', methods=['GET'])
def get_entries_by_date(start_date, end_date):
    try:
        # Extract the token from the request headers
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401
        
        # Decode the token to get the user ID
        token = token.split()[1]  # Assuming the token is in the format 'Bearer <token>'
        decoded = jwt.decode(token, 'python', algorithms=['HS256'])
        user_id = decoded.get('user_id')
        
        # Validate date format
        try:
            datetime.strptime(start_date, '%Y-%m-%d')
            datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        # Get the sort order from query parameters, default to 'asc'
        sort_order = request.args.get('sort', 'asc')
        
        # Validate sort order
        if sort_order not in ['asc', 'desc']:
            return jsonify({"error": "Invalid sort order. Use 'asc' or 'desc'."}), 400

        # Set sort direction based on the query parameter
        sort_direction = 1 if sort_order == 'asc' else -1

        # Query the database
        entries = list(db.diary_entries.find({
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": end_date}
        }).sort("date", sort_direction))

        # Convert ObjectId to string
        for entry in entries:
            entry['_id'] = str(entry['_id'])
        
        if not entries:
            return jsonify({"message": "No entries found for the selected date range."}), 200

        return jsonify({"entries": entries}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        print(f"Error in get_entries_by_date: {e}")  # Log the error for debugging
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5006, debug=True)
