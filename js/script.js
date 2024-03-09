document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = "https://api.openai.com/v1/audio/speech";
    document.getElementById('apiUrl').innerText = `API URL: ${apiUrl}`;

    const modelOptions = [
        { id: "tts-1", name: "Text-to-Speech v1" },
        { id: "tts-1-hd", name: "Text-to-Speech v1 HD"},
    ];
    const voiceOptions = [
        { id: "alloy", name: "Alloy - Male" },
        { id: "echo", name: "Echo - Male" },
        { id: "fable", name: "Fable - Male" },
        { id: "onyx", name: "Onyx - Male (Deep)" },
        { id: "nova", name: "Nova - Female" },
        { id: "shimmer", name: "Shimmer - Female" }
    ];
    const outputFormatOptions = [
        { id: "mp3", name: "MP3" },
        { id: "opus", name: "Opus" },
        { id: "aac", name: "AAC" },
        { id: "flac", name: "FLAC" },
        { id: "wav", name: "WAV" }
    ];
    const transcriptions = []; // Array to hold session transcriptions

    populateSelectOptions('model', modelOptions);
    populateSelectOptions('voice', voiceOptions);
    populateSelectOptions('outputFormat', outputFormatOptions);

    const apiTokenInput = document.getElementById('apiToken');
    apiTokenInput.value = localStorage.getItem('apiToken') || '';
    apiTokenInput.addEventListener('change', () => {
        localStorage.setItem('apiToken', apiTokenInput.value);
    });

    const outputFormatSelect = document.getElementById('outputFormat');
    outputFormatSelect.value = localStorage.getItem('outputFormat') || 'mp3';
    outputFormatSelect.addEventListener('change', () => {
        localStorage.setItem('outputFormat', outputFormatSelect.value);
    });

    document.getElementById('deleteToken').addEventListener('click', () => {
        localStorage.removeItem('apiToken');
        apiTokenInput.value = '';
    });

    document.getElementById('generate').addEventListener('click', () => {
        const textInput = document.getElementById('textInput');
        const status = document.getElementById('status');
        const loading = document.getElementById('loading');

        if (!apiTokenInput.value || !document.getElementById('model').value || !document.getElementById('voice').value || !textInput.value) {
            alert('Please fill all fields and ensure the API token is saved.');
            return;
        }

        status.textContent = '';
        loading.style.display = 'inline-block';

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiTokenInput.value}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: document.getElementById('model').value,
                input: textInput.value,
                voice: document.getElementById('voice').value,
                response_format: outputFormatSelect.value // Newly added
            })
        }).then(response => response.blob())
          .then(blob => {
              const url = window.URL.createObjectURL(blob);
              transcriptions.push({ url, name: textInput.value.substring(0, 30) + '...' });
              updateTranscriptionList();
              playAudio(url);
              textInput.value = ''; // Clear text area after generating
              status.textContent = 'Speech generated successfully!';
              loading.style.display = 'none';
          }).catch(error => {
              console.error('Error:', error);
              status.textContent = 'Error generating speech. Please try again.';
              loading.style.display = 'none';
          });
    });

    function populateSelectOptions(selectId, options) {
        const select = document.getElementById(selectId);
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.id;
            opt.innerHTML = option.name;
            select.appendChild(opt);
        });
        // Select the stored value if it exists
        const storedValue = localStorage.getItem(selectId);
        if (storedValue) {
            select.value = storedValue;
        }
    }

    function playAudio(url) {
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = url;
        document.getElementById('audioPlayerContainer').classList.remove('hidden');
        audioPlayer.autoplay = true;
    }

    function updateTranscriptionList() {
        const listElement = document.getElementById('transcribedList');
        listElement.innerHTML = ''; // Clear existing list

        transcriptions.forEach((transcription, index) => {
            const item = document.createElement('div');
            item.className = 'py-2';
            item.innerHTML = `
                <p class="text-sm">${transcription.name}</p>
                <audio controls src="${transcription.url}"></audio>
            `;
            listElement.appendChild(item);
        });
    }

    document.getElementById('toggleList').addEventListener('click', () => {
        document.getElementById('transcribedList').classList.toggle('hidden');
    });
});
