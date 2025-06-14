// Add download button to Swagger UI
window.onload = function() {
  // Create download button container
  const downloadContainer = document.createElement('div');
  downloadContainer.style.position = 'fixed';
  downloadContainer.style.bottom = '20px';
  downloadContainer.style.right = '20px';
  downloadContainer.style.zIndex = '1000';
  
  // Create download button
  const downloadButton = document.createElement('a');
  downloadButton.href = '/api-docs/download';
  downloadButton.textContent = 'Download API Docs';
  downloadButton.style.display = 'inline-block';
  downloadButton.style.backgroundColor = '#4CAF50';
  downloadButton.style.color = 'white';
  downloadButton.style.padding = '10px 20px';
  downloadButton.style.textDecoration = 'none';
  downloadButton.style.borderRadius = '4px';
  downloadButton.style.fontWeight = 'bold';
  downloadButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Add button to container
  downloadContainer.appendChild(downloadButton);
  
  // Add container to body
  document.body.appendChild(downloadContainer);
};