// Saves options to chrome.storage
const save_options = () => {
  const apiKey = (document.getElementById('api-key') as HTMLInputElement).value
  const resolution = (document.getElementById('resolution') as HTMLSelectElement).value
  const numberOfImages = (document.getElementById('n-images') as HTMLSelectElement).value
  chrome.storage.sync.set({ apiKey, resolution, numberOfImages }, () => {
    window.close()
  })
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restore_options = async (): Promise<void> => {
  // Use default value color = 'red' and likesColor = true.
  const { apiKey, resolution, numberOfImages } = await chrome.storage.sync.get({
    apiKey: '',
    resolution: '1024x1024',
    numberOfImages: 5,
  })

  const apiKeyElement = document.getElementById('api-key') as HTMLInputElement
  apiKeyElement.value = apiKey
  const resolutionElement = document.getElementById('resolution') as HTMLSelectElement
  resolutionElement.value = resolution
  const numberOfImagesElement = document.getElementById('n-images') as HTMLSelectElement
  numberOfImagesElement.value = numberOfImages
}
document.addEventListener('DOMContentLoaded', restore_options)
document.getElementById('save')?.addEventListener('click', save_options)
