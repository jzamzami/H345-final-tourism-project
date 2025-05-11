from flask import Flask, request, jsonify
import pandas as pd
import psycopg2
from sentence_transformers import SentenceTransformer
import json
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)

model = SentenceTransformer('all-MiniLM-L6-v2')

DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "tourism_db"
DB_USER = "your_user"
DB_PASSWORD = "your_password"

def insert_data(batch):
    conn = psycopg2.connect(
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT
    )
    cursor = conn.cursor()
    insert_query = """
        INSERT INTO tourism_data (
            location, country, category, visitors, rating, revenue, accommodation_available, embedding
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.executemany(insert_query, batch)
        conn.commit()
    except Exception as e:
        print(f"Error inserting batch: {e}")
    finally:
        cursor.close()
        conn.close()

@app.route('/insert_embeddings', methods=['POST'])
def insert_embeddings():
    csv_path = request.json.get('csv_path')
    if not csv_path:
        return jsonify({"error": "CSV path is required."}), 400
    df = pd.read_csv(csv_path)
    batch_size = 1000
    batch = []
    for _, row in df.iterrows():
        text = f"{row['Location']} {row['Country']} {row['Category']}"
        embedding = model.encode(text).tolist()
        batch.append((
            row['Location'], row['Country'], row['Category'], row['Visitors'], row['Rating'],
            row['Revenue'], row['Accommodation_Available'] == 'Yes', json.dumps(embedding)
        ))
        if len(batch) >= batch_size:
            insert_data(batch)
            batch = []
    if batch:
        insert_data(batch)
    return jsonify({"message": "Data inserted successfully with embeddings."})

@app.route('/find_similar', methods=['POST'])
def find_similar():
    query = request.json.get('query')
    if not query:
        return jsonify({"error": "Query is required."}), 400
    query_embedding = model.encode(query).reshape(1, -1)
    conn = psycopg2.connect(
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT
    )
    cursor = conn.cursor()
    cursor.execute("SELECT id, embedding FROM tourism_data")
    results = cursor.fetchall()
    cursor.close()
    best_match = None
    best_score = -1

    for row_id, emb_json in results:
        emb = np.array(json.loads(emb_json)).reshape(1, -1)
        score = cosine_similarity(query_embedding, emb)[0][0]
        if score > best_score:
            best_score = score
            best_match = row_id
    conn.close()
    return jsonify({"best_match": best_match, "score": best_score})

if __name__ == '__main__':
    app.run(debug=True)