const ASSEMBLY_AI_API_KEY = process.env.REACT_APP_ASSEMBLY_AI_KEY;
const ASSEMBLY_AI_API_URL = 'https://api.assemblyai.com/v2';

export const uploadAudio = async (audioFile: File): Promise<string> => {
  const response = await fetch(`${ASSEMBLY_AI_API_URL}/upload`, {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLY_AI_API_KEY || ''
    },
    body: audioFile
  });

  const { upload_url } = await response.json();
  return upload_url;
};

export const transcribeAudio = async (audioUrl: string): Promise<string> => {
  // Submit the audio file for transcription
  const response = await fetch(`${ASSEMBLY_AI_API_URL}/transcript`, {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLY_AI_API_KEY || '',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      language_detection: true
    })
  });

  const { id } = await response.json();
  
  // Poll for the transcription result
  while (true) {
    const pollingResponse = await fetch(`${ASSEMBLY_AI_API_URL}/transcript/${id}`, {
      headers: {
        'authorization': ASSEMBLY_AI_API_KEY || ''
      }
    });
    
    const transcriptionResult = await pollingResponse.json();

    if (transcriptionResult.status === 'completed') {
      return transcriptionResult.text;
    } else if (transcriptionResult.status === 'error') {
      throw new Error('Transcription failed');
    }

    // Wait for 1 second before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}; 