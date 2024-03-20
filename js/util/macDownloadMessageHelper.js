document.addEventListener('DOMContentLoaded', (event) => {
    const checkbox = document.getElementById('acknowledgementCheckbox')
    const downloadButton = document.getElementById('macDownloadButton')

    function toggleDownloadButton() {
        if (checkbox.checked) {
            downloadButton.classList.remove('disabled')
            downloadButton.removeAttribute('disabled')
        } else {
            downloadButton.classList.add('disabled')
            downloadButton.setAttribute('disabled', 'disabled')
        }
    }
    checkbox.addEventListener('change', toggleDownloadButton)

    downloadButton.addEventListener('click', (e) => {
        if (downloadButton.classList.contains('disabled')) {
            e.preventDefault()
        }
    })

    toggleDownloadButton()
})
