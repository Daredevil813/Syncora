# ✨ Syncora: Sync Up, Stream Together ✨

**Syncora** is a web application that redefines online social experiences with synchronized video streaming, live chat, playlist management, and interactive party features. Users can join rooms, create and edit playlists, and start instant public parties — all while enjoying synchronized video streams with friends.

## 🔥 Features

* 🎥 Real-time synchronized video playback
* 💬 Live chat and messaging per room
* 📺 Create or join instant party rooms
* 🎵 Seamless playlist management (create, edit, view)
* 🧑‍🤝‍🧑 Interactive and social environment

## ⚙️ Tech Stack

* **Frontend:** Next.js (React)
* **Backend:** Django + Django Channels
* **Database:** MySQL
* **Real-Time:** WebSockets (via Django Channels)
* **APIs:** REST + WebSocket integration

## 🚀 Getting Started

1. **Clone the repo**

```
git clone https://github.com/yourusername/syncora.git
cd syncora
```

2. **Set up the backend**

```
cd backend
python -m venv env
source env/bin/activate  # or env\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. **Set up the frontend**

```
cd ../frontend
npm install
npm run dev
```

## 📄 License

MIT License

---

Built with ❤️ using Django, Next.js, and MySQL.

