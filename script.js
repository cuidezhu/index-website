const colorThief = new ColorThief();

// 预定义的图片列表作为备选
const fallbackImages = [
    // 银河和宇宙主题
    'https://images.unsplash.com/photo-1462332420958-a05d1e002413?auto=format&fit=crop&w=2560&q=80', // 壮观的银河
    'https://images.unsplash.com/photo-1522124624696-7ea32eb9592c?auto=format&fit=crop&w=2560&q=80', // 北极光下的银河
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=2560&q=80', // 地球与月球

    // 城市主题
    'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?auto=format&fit=crop&w=2560&q=80', // 香港夜景
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=2560&q=80', // 纽约中央公园俯瞰图

    // 自然风光
    'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=2560&q=80', // 湖泊和山脉
    'https://images.unsplash.com/photo-1455156218388-5e61b526818b?auto=format&fit=crop&w=2560&q=80', // 雄伟的瀑布

    // 挪威风光
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=80', // 挪威峡湾
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=2560&q=80', // 罗弗敦群岛的极光
];

function getContrastYIQ(r, g, b) {
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}

function getContrastColor(r, g, b) {
    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness > 200) {
        // 非常亮的背景，使用深色文字
        return 'rgba(0, 0, 0, 0.8)';
    } else if (brightness > 125) {
        // 较亮的背景，使用稍浅的深色文字
        return 'rgba(0, 0, 0, 0.6)';
    } else if (brightness > 50) {
        // 较暗的背景，使用浅色文字
        return 'rgba(255, 255, 255, 0.8)';
    } else {
        // 非常暗的背景，使用白色文字
        return 'rgba(255, 255, 255, 1)';
    }
}

function generateRichColors(r, g, b) {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    let textColor, btnBgColor, btnTextColor;

    if (brightness > 128) {
        // 亮色背景
        textColor = 'rgba(0, 0, 0, 0.9)'; // 深色文字
        btnBgColor = 'rgba(255, 255, 255, 0.3)'; // 半透明白色按钮背景
        btnTextColor = 'rgba(0, 0, 0, 0.9)'; // 深色按钮文字
    } else {
        // 暗色背景
        textColor = 'rgba(255, 255, 255, 0.9)'; // 浅色文字
        btnBgColor = 'rgba(0, 0, 0, 0.3)'; // 透明黑色按钮背景
        btnTextColor = 'rgba(255, 255, 255, 0.9)'; // 浅色按钮文字
    }

    return { textColor, btnBgColor, btnTextColor };
}

function getCachedImageUrls() {
    return JSON.parse(localStorage.getItem('cachedImageUrls')) || [];
}

function setCachedImageUrls(urls) {
    localStorage.setItem('cachedImageUrls', JSON.stringify(urls));
}

function getRandomImage(images) {
    return images[Math.floor(Math.random() * images.length)];
}

let lastRequestTime = parseInt(localStorage.getItem('lastRequestTime') || '0');
const requestCooldown = 3600000; // 1小时冷却时间
const cacheSize = 20; // 缓存的图URL数量

async function fetchAndCacheImages() {
    const currentTime = Date.now();
    if (currentTime - lastRequestTime < requestCooldown) {
        console.log('API冷却中，使用现有缓存');
        return getCachedImageUrls();
    }

    try {
        console.log('获取新的图片URL批次...');
        const urls = [];
        for (let i = 0; i < cacheSize; i++) {
            const response = await fetch('/.netlify/functions/getUnsplashImage');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            urls.push(data);
        }
        setCachedImageUrls(urls);
        localStorage.setItem('lastRequestTime', currentTime.toString());
        console.log('成功缓存新的图片URL批次');
        return urls;
    } catch (error) {
        console.error('获取图片失败，使用备选图片:', error);
        return fallbackImages;
    }
}

async function setRandomBackground() {
    try {
        let imageData = getCachedImageUrls();
        if (imageData.length === 0) {
            imageData = await fetchAndCacheImages();
        }
        
        const selectedImage = getRandomImage(imageData);
        
        await setBackgroundImage(selectedImage.imageUrl || selectedImage);
    } catch (error) {
        console.error('获取背景图片时出错:', error);
        const fallbackUrl = getRandomImage(fallbackImages);
        await setBackgroundImage(fallbackUrl);
    }
}

async function setBackgroundImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            console.log('图片加载成功，设置背景...');
            document.querySelector('.container').style.backgroundImage = `url(${imageUrl})`;
            const dominantColor = colorThief.getColor(img);
            const { textColor, btnBgColor, btnTextColor } = generateRichColors(...dominantColor);
            document.documentElement.style.setProperty('--text-color', textColor);
            document.documentElement.style.setProperty('--btn-bg-color', btnBgColor);
            document.documentElement.style.setProperty('--btn-text-color', btnTextColor);
            console.log('背景设置完成，文字颜色:', textColor, '按钮背景色:', btnBgColor, '按钮文字颜色:', btnTextColor);
            
            // 更新归属信息
            updateAttribution(imageUrl);
            resolve();
        }
        img.onerror = function() {
            console.error('图片加载失败，尝试使用备选图片');
            if (fallbackImages.includes(imageUrl)) {
                reject(new Error('所有备选图片均加载失败'));
            } else {
                const fallbackUrl = getRandomImage(fallbackImages);
                setBackgroundImage(fallbackUrl).then(resolve).catch(reject);
            }
        }
        img.src = imageUrl;
    });
}

function updateAttribution(imageUrl) {
    const attribution = document.getElementById('attribution');
    if (fallbackImages.includes(imageUrl)) {
        attribution.innerHTML = 'Photo from Unsplash';
    } else {
        attribution.innerHTML = `
            Photo by <a href="${imageUrl.photographerUrl}" target="_blank">${imageUrl.photographerName}</a> on 
            <a href="${imageUrl.unsplashUrl}" target="_blank">Unsplash</a>
        `;
    }
}

// 页面加载时设置背景
setRandomBackground();

// 可选：每隔一定时间更换背景
// setInterval(setRandomBackground, 300000); // 每5分钟更换一次背景