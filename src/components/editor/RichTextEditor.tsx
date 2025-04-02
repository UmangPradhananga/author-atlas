
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image,
  Heading1,
  Heading2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  minHeight?: string;
}

const RichTextEditor = ({ 
  initialContent = '', 
  placeholder = 'Start typing your manuscript...',
  onChange,
  minHeight = '300px'
}: RichTextEditorProps) => {
  const [content, setContent] = useState(initialContent);
  
  const handleCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    
    // Get the updated content after command execution
    const editorContent = document.getElementById('editor')?.innerHTML;
    if (editorContent !== undefined) {
      setContent(editorContent);
      onChange?.(editorContent);
    }
  };

  const handleContentChange = () => {
    const editorContent = document.getElementById('editor')?.innerHTML;
    if (editorContent !== undefined) {
      setContent(editorContent);
      onChange?.(editorContent);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      handleCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      handleCommand('insertImage', url);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    active = false,
    title
  }: { 
    onClick: () => void, 
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
    active?: boolean,
    title: string
  }) => (
    <Button 
      type="button" 
      variant="ghost" 
      size="sm" 
      className={cn(
        "h-8 px-2",
        active && "bg-muted"
      )}
      onClick={onClick}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="border rounded-md bg-card">
      <div className="border-b p-2 flex flex-wrap gap-0.5">
        <div className="flex mr-1 border-r pr-1">
          <ToolbarButton 
            onClick={() => handleCommand('bold')} 
            icon={Bold} 
            title="Bold"
          />
          <ToolbarButton 
            onClick={() => handleCommand('italic')} 
            icon={Italic}
            title="Italic"
          />
          <ToolbarButton 
            onClick={() => handleCommand('underline')} 
            icon={Underline}
            title="Underline"
          />
        </div>
        
        <div className="flex mr-1 border-r pr-1">
          <ToolbarButton 
            onClick={() => handleCommand('formatBlock', '<h1>')} 
            icon={Heading1}
            title="Heading 1"
          />
          <ToolbarButton 
            onClick={() => handleCommand('formatBlock', '<h2>')} 
            icon={Heading2}
            title="Heading 2"
          />
        </div>
        
        <div className="flex mr-1 border-r pr-1">
          <ToolbarButton 
            onClick={() => handleCommand('insertUnorderedList')} 
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton 
            onClick={() => handleCommand('insertOrderedList')} 
            icon={ListOrdered}
            title="Numbered List"
          />
        </div>
        
        <div className="flex mr-1 border-r pr-1">
          <ToolbarButton 
            onClick={() => handleCommand('justifyLeft')} 
            icon={AlignLeft}
            title="Align Left"
          />
          <ToolbarButton 
            onClick={() => handleCommand('justifyCenter')} 
            icon={AlignCenter}
            title="Align Center"
          />
          <ToolbarButton 
            onClick={() => handleCommand('justifyRight')} 
            icon={AlignRight}
            title="Align Right"
          />
        </div>
        
        <div className="flex">
          <ToolbarButton 
            onClick={insertLink} 
            icon={LinkIcon}
            title="Insert Link"
          />
          <ToolbarButton 
            onClick={insertImage} 
            icon={Image}
            title="Insert Image"
          />
        </div>
      </div>
      <div 
        id="editor" 
        contentEditable 
        className="p-4 focus:outline-none overflow-auto"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={handleContentChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
