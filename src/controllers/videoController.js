const fetch = require("node-fetch");

const searchVideos = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "q is required" });
    }

    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
      return res.status(500).json({ message: "YouTube API key not configured" });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=4&q=${encodeURIComponent(
      query
    )}&key=${key}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ message: "YouTube API error" });
    }

    const data = await response.json();
    const videos = (data.items || []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.channelTitle,
    }));

    res.json({ data: videos });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchVideos };
