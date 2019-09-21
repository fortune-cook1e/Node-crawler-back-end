function _fetch(url) {
  const options = {
    method:'POST',
    headers:{
      'Connection': 'keep-alive',
      'Accept-Encoding': '',
      'Accept-Language': 'en-US,en;q=0.8'
    }
  }
  return fetch(url,options)
}