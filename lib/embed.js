import renderTextItems from './text-items';
const twitterRegex = /^https?:\/\/twitter\.com\/([-a-zA-Z0-9+&@#%?=~_|!:,.;]+)\/status(es){0,1}\/(\d+)/;

function formatTwitterUrl (url) {
  const match = url.match(twitterRegex);
  if (!match) {
    return '';
  }

  return `https://twitter.com/${match[1]}/status/${match[3]}`;
}

function createTwitterEmbed ({url}) {
  const formatted = formatTwitterUrl(url);
  if (!formatted) {
    return null;
  }

  return {
    role: 'tweet',
    URL: formatted
  };
}

const embeds = {
  giphy: ({id}) => ({
    role: 'image',
    URL: `https://media.giphy.com/media/${id}/giphy.gif`
  }),
  instagram: ({id}) => ({
    role: 'instagram',
    // use id to assure the url is correct
    URL: `https://instagram.com/p/${id}`
  }),
  facebook: ({id, url, embedAs}) => {
    if (url.indexOf('?') > -1) {
      url = url.substr(0, url.indexOf('?'));
    }
    if (embedAs === 'photo') {
      let username = url.replace('https://www.facebook.com/', '');
      username = username.substr(0, username.indexOf('/'));
      const postId = url.substr(url.lastIndexOf('/') + 1);
      url = `https://www.facebook.com/${username}/posts/${postId}`;
    }

    return {
      role: 'facebook_post',
      URL: url
    };
  },
  twitter: createTwitterEmbed,
  youtube: ({youtubeId}) => ({
    role: 'embedwebvideo',
    URL: `https://www.youtube.com/embed/${youtubeId}`
  }),
  vimeo: ({id}) => ({
    role: 'embedwebvideo',
    URL: `https://player.vimeo.com/video/${id}`
  }),
  video: ({sources}) => ({
    role: 'video',
    URL: sources[0].src
  }),
  image: ({src}) => ({
    role: 'photo',
    URL: src
  })
};

const render = (item, opts) => {
  opts = opts || {};
  const embed = embeds[item.embedType](item);

  if (!embed) {
    return null;
  }

  if (opts.mediaStyle) {
    embed.style = opts.mediaStyle;
  }

  if (opts.mediaLayout) {
    embed.layout = opts.mediaLayout;
  }

  const result = {
    role: 'container',
    components: [embed]
  };

  if (opts.layout) {
    result.layout = opts.layout;
  }

  if (opts.style) {
    result.style = opts.style;
  }

  if (embed.role === 'photo' && item.caption && item.caption.length > 0) {
    const captionOpts = {
      appendNewline: true,
      textStyle: opts.captionTextStyle
    };

    if (opts.captionTextStyle) {
      captionOpts.textStyle = opts.captionTextStyle;
    }

    embed.caption = renderTextItems(null, item.caption, captionOpts);
  }

  return result;
};

export default (item, opts) => embeds[item.embedType] && render(item, opts);
