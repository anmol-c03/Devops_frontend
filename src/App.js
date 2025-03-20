import React, { useState, useRef } from 'react';
import axios from 'axios';
import './index.css';

function App() {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dropArea = useRef(null);
    const [outputText, setOutputText] = useState('');
    // const [prompt, setPrompt] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://20.172.37.185:5001/generate', {
                image: image,
                // prompt: prompt

            });
            setOutputText(response.data.gemini_response);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        dropArea.current.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        dropArea.current.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dropArea.current.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setError('Please drop an image file.');
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
    };

    // const handlePromptChange = (e) => {
    //     setPrompt(e.target.value);
    // };

    const handleOutputTextChange = (e) => {
        setOutputText(e.target.value);
    };

    const handleCopyToClipboard = () => {
        if (outputText) {
            navigator.clipboard.writeText(outputText)
                .then(() => {
                    alert('Text copied to clipboard');
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        }
    };

    return (
        <div className="app">
            <h1 className="app-title">TextFusion</h1>
            
            <div className="main-container">
                <div className="input-section">
                    <h2 className="section-title">Input</h2>
                    <div
                        ref={dropArea}
                        className="drop-area"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {image ? (
                            <div className="image-container">
                                <img src={image} alt="Uploaded" className="preview-image" />
                                <button className="remove-image" onClick={handleRemoveImage}>
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <p className="drop-text">Drag image here or click to import</p>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="fileInput"
                        />
                        <label htmlFor="fileInput" className="file-label">
                            Import Image
                        </label>
                    </div>
                    
                    {/* <div className="prompt-container">
                        <textarea
                            placeholder="Enter your prompt here..."
                            value={prompt}
                            onChange={handlePromptChange}
                            className="prompt-input"
                        />
                    </div> */}
                    
                    <div className="button-container">
                        <button 
                            className="generate-button"
                            onClick={handleGenerate} 
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Process Image'}
                        </button>
                    </div>
                </div>
                
                <div className="output-section">
                    <h2 className="section-title">Output</h2>
                    <div className="output-box">
                        {error && <div className="error-message">{error}</div>}
                        
                        {loading && (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <p>Processing image, please wait...</p>
                            </div>
                        )}
                        
                        <div className="response-container">
                            <textarea
                                className="output-textarea"
                                value={outputText}
                                onChange={handleOutputTextChange}
                                placeholder="Response will appear here..."
                                style={{flex: 1, minHeight: '300px'}}
                            />
                            
                            {outputText && (
                                <div className="action-buttons">
                                    <button className="copy-button" onClick={handleCopyToClipboard}>
                                        Copy Text
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;