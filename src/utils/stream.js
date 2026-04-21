/**
 * Converts a regular stream URL (YouTube/Twitch) into an embeddable URL.
 * @param {string} url - The original stream URL
 * @returns {string|null} - The embed URL or null if not supported
 */
const getEmbedUrl = (url) => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();

    // YouTube
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId = '';
      if (host.includes('youtu.be')) {
        videoId = urlObj.pathname.substring(1);
      } else {
        videoId = urlObj.searchParams.get('v');
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Twitch
    if (host.includes('twitch.tv')) {
      const channelName = urlObj.pathname.substring(1).split('/')[0];
      // Note: Twitch embed requires parent domain for security (usually the frontend domain)
      return `https://player.twitch.tv/?channel=${channelName}&parent=${process.env.FRONTEND_DOMAIN || 'localhost'}`;
    }

    // TikTok (Basic support)
    if (host.includes('tiktok.com')) {
      return url; // TikTok embeds are usually complex script-based, returning original for now
    }

    return url; // Default to original URL
  } catch (e) {
    return null;
  }
};

module.exports = { getEmbedUrl };
