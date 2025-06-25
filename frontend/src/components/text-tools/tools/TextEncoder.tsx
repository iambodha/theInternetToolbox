'use client';

import { useState } from 'react';

export default function TextEncoder() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [operation, setOperation] = useState<'encode' | 'decode'>('encode');
  const [method, setMethod] = useState('base64');

  const encodingMethods = [
    { id: 'base64', name: 'Base64', description: 'Standard Base64 encoding' },
    { id: 'url', name: 'URL Encode', description: 'Percent-encoding for URLs' },
    { id: 'html', name: 'HTML Entities', description: 'HTML character entities' },
    { id: 'hex', name: 'Hexadecimal', description: 'Convert to hex values' },
    { id: 'binary', name: 'Binary', description: 'Convert to binary representation' },
    { id: 'ascii', name: 'ASCII Codes', description: 'ASCII character codes' },
    { id: 'morse', name: 'Morse Code', description: 'Morse code encoding' },
    { id: 'rot13', name: 'ROT13', description: 'Simple letter substitution cipher' },
  ];

  const morseCodeMap: { [key: string]: string } = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/'
  };

  const reverseMorseMap = Object.fromEntries(
    Object.entries(morseCodeMap).map(([k, v]) => [v, k])
  );

  const processText = () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    let result = '';

    try {
      if (operation === 'encode') {
        switch (method) {
          case 'base64':
            result = btoa(unescape(encodeURIComponent(inputText)));
            break;
          case 'url':
            result = encodeURIComponent(inputText);
            break;
          case 'html':
            result = inputText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
            break;
          case 'hex':
            result = Array.from(inputText)
              .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
              .join(' ');
            break;
          case 'binary':
            result = Array.from(inputText)
              .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
              .join(' ');
            break;
          case 'ascii':
            result = Array.from(inputText)
              .map(char => char.charCodeAt(0).toString())
              .join(' ');
            break;
          case 'morse':
            result = inputText.toUpperCase()
              .split('')
              .map(char => morseCodeMap[char] || char)
              .join(' ');
            break;
          case 'rot13':
            result = inputText.replace(/[A-Za-z]/g, (char) => {
              const start = char <= 'Z' ? 65 : 97;
              return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
            });
            break;
        }
      } else { // decode
        switch (method) {
          case 'base64':
            result = decodeURIComponent(escape(atob(inputText)));
            break;
          case 'url':
            result = decodeURIComponent(inputText);
            break;
          case 'html':
            result = inputText
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
            break;
          case 'hex':
            result = inputText
              .split(' ')
              .map(hex => String.fromCharCode(parseInt(hex, 16)))
              .join('');
            break;
          case 'binary':
            result = inputText
              .split(' ')
              .map(bin => String.fromCharCode(parseInt(bin, 2)))
              .join('');
            break;
          case 'ascii':
            result = inputText
              .split(' ')
              .map(code => String.fromCharCode(parseInt(code)))
              .join('');
            break;
          case 'morse':
            result = inputText
              .split(' ')
              .map(code => reverseMorseMap[code] || code)
              .join('')
              .replace(/\//g, ' ');
            break;
          case 'rot13':
            result = inputText.replace(/[A-Za-z]/g, (char) => {
              const start = char <= 'Z' ? 65 : 97;
              return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
            });
            break;
        }
      }
    } catch (error) {
      result = 'Error: Invalid input for this encoding method';
    }

    setOutputText(result);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText);
  };

  const swapInputOutput = () => {
    setInputText(outputText);
    setOutputText('');
    setOperation(operation === 'encode' ? 'decode' : 'encode');
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="space-y-6">
      {/* Method and Operation Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium">Encoding Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border border-foreground/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            {encodingMethods.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} - {m.description}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Operation</label>
          <div className="flex gap-2">
            <button
              onClick={() => setOperation('encode')}
              className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                operation === 'encode'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setOperation('decode')}
              className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                operation === 'decode'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              Decode
            </button>
          </div>
        </div>
      </div>

      {/* Input Text */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="input-text" className="block text-sm font-medium">
            Input Text
          </label>
          <div className="flex gap-2">
            <button
              onClick={swapInputOutput}
              className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
              disabled={!outputText}
            >
              ⇄ Swap
            </button>
            <button
              onClick={clearAll}
              className="px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          id="input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Enter text to ${operation}...`}
          className="w-full h-32 p-3 border border-foreground/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background font-mono text-sm"
        />
      </div>

      {/* Process Button */}
      <div className="flex justify-center">
        <button
          onClick={processText}
          disabled={!inputText.trim()}
          className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {operation === 'encode' ? 'Encode' : 'Decode'} with {encodingMethods.find(m => m.id === method)?.name}
        </button>
      </div>

      {/* Output Text */}
      {outputText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">
              {operation === 'encode' ? 'Encoded' : 'Decoded'} Text
            </label>
            <button
              onClick={copyOutput}
              className="px-3 py-1 text-sm bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
            >
              Copy
            </button>
          </div>
          <textarea
            value={outputText}
            readOnly
            className="w-full h-32 p-3 border border-foreground/20 rounded-lg resize-none bg-background font-mono text-sm"
          />
        </div>
      )}

      {/* Method Information */}
      <div className="bg-foreground/5 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Encoding Methods</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-1">Base64:</div>
            <div className="text-foreground/60">Standard encoding for binary data</div>
          </div>
          <div>
            <div className="font-medium mb-1">URL Encode:</div>
            <div className="text-foreground/60">Percent-encoding for web URLs</div>
          </div>
          <div>
            <div className="font-medium mb-1">HTML Entities:</div>
            <div className="text-foreground/60">Escape HTML special characters</div>
          </div>
          <div>
            <div className="font-medium mb-1">Hexadecimal:</div>
            <div className="text-foreground/60">Convert to hexadecimal values</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {inputText && outputText && (
        <div className="p-4 bg-foreground/5 rounded-lg">
          <h4 className="font-semibold mb-3">Conversion Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-foreground/60">Input length:</span>
              <span className="ml-2 font-medium">{inputText.length}</span>
            </div>
            <div>
              <span className="text-foreground/60">Output length:</span>
              <span className="ml-2 font-medium">{outputText.length}</span>
            </div>
            <div>
              <span className="text-foreground/60">Method:</span>
              <span className="ml-2 font-medium">{encodingMethods.find(m => m.id === method)?.name}</span>
            </div>
            <div>
              <span className="text-foreground/60">Operation:</span>
              <span className="ml-2 font-medium capitalize">{operation}</span>
            </div>
          </div>
        </div>
      )}

      {!inputText && (
        <div className="text-center p-8 text-foreground/60">
          <div className="text-4xl mb-4">🔐</div>
          <p>Enter text above to encode or decode it</p>
          <p className="text-sm mt-2">Support for Base64, URL encoding, HTML entities, and more</p>
        </div>
      )}
    </div>
  );
}