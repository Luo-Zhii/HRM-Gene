import os
import re

def find_files_needing_use_client(root_dir):
    client_patterns = [
        r'useState', r'useEffect', r'useContext', r'useReducer', r'useRef',
        r'useCallback', r'useMemo', r'useLayoutEffect', r'useImperativeHandle',
        r'useRouter', r'usePathname', r'useParams', r'useSearchParams',
        r'onClick', r'onChange', r'onSubmit', r'onMouseEnter', r'onMouseLeave',
        r'createContext'
    ]
    
    missing_files = []
    
    for dirpath, _, filenames in os.walk(root_dir):
        if 'node_modules' in dirpath or '.next' in dirpath:
            continue
            
        for filename in filenames:
            if filename.endswith(('.tsx', '.ts', '.jsx', '.js')):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Check if already has use client
                    if 'use client' in content[:500]: # Check top of file
                        continue
                        
                    # Check for client-side patterns
                    needs_client = False
                    for pattern in client_patterns:
                        if re.search(pattern, content):
                            needs_client = True
                            # print(f"Found {pattern} in {filepath}")
                            break
                    
                    if needs_client:
                        missing_files.append(filepath)
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")
                    
    return missing_files

if __name__ == "__main__":
    root = "/home/luozhi/Documents/HRM-Gene/frontend"
    files = find_files_needing_use_client(root)
    print("Files needing 'use client':")
    for f in files:
        print(f)
