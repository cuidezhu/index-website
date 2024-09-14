const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=nature,landscape,space,modern,city&orientation=landscape&client_id=${accessKey}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        imageUrl: data.urls.regular,
        photographerName: data.user.name,
        photographerUrl: data.user.links.html + '?utm_source=laocui_homepage&utm_medium=referral',
        unsplashUrl: 'https://unsplash.com/?utm_source=laocui_homepage&utm_medium=referral'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch image from Unsplash' })
    };
  }
};