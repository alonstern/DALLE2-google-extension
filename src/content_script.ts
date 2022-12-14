import axios, { AxiosError } from 'axios'

const generateImage = async (
  apiKey: string,
  prompt: string,
  numberOfImages: number,
  resolution: string,
): Promise<string[]> => {
  const response = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      prompt,
      n: numberOfImages,
      size: resolution,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  )
  return response.data.data.map((data: { url: string }) => data.url)
}

const createImageElement = (url: string, prompt: string): HTMLElement => {
  const img = document.createElement('img')
  img.className = 'dalle-image'
  img.src = url
  img.alt = prompt

  const link = document.createElement('a')
  link.href = url
  link.className = 'dalle-link'
  link.target = '_blank'
  link.appendChild(img)
  return link
}

const createErrorElement = (err: unknown): HTMLElement => {
  const error = document.createElement('p')
  error.className = 'dalle-error'

  if (err instanceof AxiosError && err.response?.status === 401) {
    error.innerText = 'Incorrect API Key was provided.'
  } else {
    error.innerText = 'Failed to generate images.'
  }
  return error
}

const run = async (prompt: string): Promise<void> => {
  const container = document.createElement('div')
  container.className = 'dalle-container'

  const title = document.createElement('p')
  title.className = 'dalle-loading'
  title.innerText = 'Loading DALL-E 2 images...'

  container.appendChild(title)
  ;(document.getElementById('islmp') as HTMLDivElement).prepend(container)

  const { apiKey, resolution, numberOfImages } = await chrome.storage.sync.get({
    apiKey: '',
    resolution: '1024x1024',
    numberOfImages: 5,
  })

  if (apiKey === '') {
    const message = document.createElement('p')
    message.className = 'dalle-warning'
    message.innerText =
      'DALL-E 2 API Key is required to generate images. Please generate an API Key in https://beta.openai.com/account/api-keys and set the API Key in the extension options'
    container.appendChild(message)
  } else {
    try {
      const urls = await generateImage(apiKey, prompt, Number(numberOfImages), resolution)

      const imagesContainer = document.createElement('div')
      imagesContainer.className = 'dalle-images-container'

      container.appendChild(imagesContainer)

      urls
        .map((url) => createImageElement(url, prompt))
        .forEach((link) => {
          imagesContainer.appendChild(link)
        })
    } catch (err) {
      const error = createErrorElement(err)

      container.appendChild(error)
      console.log(err)
    }
  }

  title.className = 'dalle-title'
  title.innerText = 'DALL-E 2 Images:'
}

const searchInput = document.getElementsByName('q')[0]
if (searchInput instanceof HTMLInputElement && searchInput.value) {
  // only run on first page
  const startParam = new URL(location.href).searchParams.get('start') || '0'
  if (startParam === '0') {
    run(searchInput.value)
  }
}
