#!/bin/bash

cd frontend/src

# Replace in all JS files
find . -name "*.js" -type f | while read file; do
  if grep -q "localhost:5001" "$file"; then
    # Add import if not exists
    if ! grep -q "import API_URL from" "$file"; then
      # Check if it's a component/page file
      if grep -q "import React" "$file"; then
        sed -i '' "2i\\
import API_URL from '../config/api';\\
" "$file" 2>/dev/null || sed -i '' "2i\\
import API_URL from '../../config/api';\\
" "$file" 2>/dev/null
      fi
    fi
    
    # Replace URLs
    sed -i '' 's|http://localhost:5001|${API_URL}|g' "$file"
    sed -i '' "s|'http://localhost:5001'|\`\${API_URL}\`|g" "$file"
    sed -i '' 's|"http://localhost:5001"|`${API_URL}`|g' "$file"
    
    echo "Updated: $file"
  fi
done

echo "✅ All files updated!"
