
import { createRoot } from 'react-dom/client'
import Index from './pages/Index'
import './index.css'

// Extension-specific entry point without router
createRoot(document.getElementById("root")!).render(<Index />);
