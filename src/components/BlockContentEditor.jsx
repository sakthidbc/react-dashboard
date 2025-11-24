import { useState } from 'react';
import { Plus, X, GripVertical, Trash2, Type, FileText, Image as ImageIcon, Video, Grid3x3, Code, ChevronDown, ChevronUp, List, Layout, Users, Star, Phone, Mail, MapPin, Award, TrendingUp, HelpCircle, Clock, Zap } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import BlockHeading from './blocks/BlockHeading';
import BlockTipTap from './blocks/BlockTipTap';
import BlockText from './blocks/BlockText';
import BlockImage from './blocks/BlockImage';
import BlockVideo from './blocks/BlockVideo';
import BlockCarousel from './blocks/BlockCarousel';
import BlockGallery from './blocks/BlockGallery';
import BlockIframe from './blocks/BlockIframe';
import BlockButton from './blocks/BlockButton';
import BlockCTA from './blocks/BlockCTA';
import BlockHero from './blocks/BlockHero';
import BlockAccordion from './blocks/BlockAccordion';
import BlockTabs from './blocks/BlockTabs';
import BlockTestimonials from './blocks/BlockTestimonials';
import BlockFAQ from './blocks/BlockFAQ';
import BlockStats from './blocks/BlockStats';
import BlockTeam from './blocks/BlockTeam';
import BlockServices from './blocks/BlockServices';
import BlockContact from './blocks/BlockContact';
import BlockTimeline from './blocks/BlockTimeline';

const BLOCK_TYPES = [
  { id: 'heading', label: 'Heading', icon: Type },
  { id: 'tiptap', label: 'Tip tap editor', icon: FileText },
  { id: 'text', label: 'Text Block', icon: FileText },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'carousel', label: 'Image carousel', icon: Grid3x3 },
  { id: 'gallery', label: 'Gallery', icon: Grid3x3 },
  { id: 'iframe', label: 'Iframe', icon: Code },
  { id: 'button', label: 'Button', icon: List },
  { id: 'cta', label: 'Call to Action', icon: Zap },
  { id: 'hero', label: 'Hero Section', icon: Layout },
  { id: 'accordion', label: 'Accordion', icon: ChevronDown },
  { id: 'tabs', label: 'Tabs', icon: List },
  { id: 'testimonials', label: 'Testimonials', icon: Star },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'stats', label: 'Stats/Numbers', icon: TrendingUp },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'services', label: 'Services', icon: Award },
  { id: 'contact', label: 'Contact Form', icon: Mail },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

const BlockContentEditor = ({ value, onChange, placeholder = 'Add content blocks...' }) => {
  const [blocks, setBlocks] = useState(() => {
    if (!value) return [];
    try {
      // Try to parse as JSON first
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      // Check if it's an array (valid blocks format)
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // If it's not an array, it might be legacy HTML content
      // Convert to a TipTap block
      if (typeof parsed === 'string' || (typeof parsed === 'object' && !Array.isArray(parsed))) {
        return [{
          id: Date.now().toString(),
          type: 'tiptap',
          data: { content: typeof parsed === 'string' ? parsed : '' }
        }];
      }
      return [];
    } catch {
      // If parsing fails, treat as legacy HTML and convert to TipTap block
      if (value && typeof value === 'string' && value.trim() !== '') {
        return [{
          id: Date.now().toString(),
          type: 'tiptap',
          data: { content: value }
        }];
      }
      return [];
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const updateBlocks = (newBlocks) => {
    setBlocks(newBlocks);
    onChange(JSON.stringify(newBlocks));
  };

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      data: getDefaultBlockData(type),
    };
    updateBlocks([...blocks, newBlock]);
    setShowModal(false);
  };

  const getDefaultBlockData = (type) => {
    switch (type) {
      case 'heading':
        return { text: '', level: 1 };
      case 'tiptap':
        return { content: '' };
      case 'text':
        return { content: '' };
      case 'image':
        return { image: null, alt: '' };
      case 'video':
        return { url: '', type: 'youtube' };
      case 'carousel':
        return { images: [] };
      case 'gallery':
        return { images: [], columns: 3 };
      case 'iframe':
        return { url: '', type: 'embed' };
      case 'button':
        return { text: '', url: '', target: '_self', style: 'primary' };
      case 'cta':
        return { title: '', description: '', buttonText: '', buttonUrl: '', backgroundImage: null };
      case 'hero':
        return { title: '', subtitle: '', description: '', backgroundImage: null, buttonText: '', buttonUrl: '' };
      case 'accordion':
        return { items: [] };
      case 'tabs':
        return { items: [] };
      case 'testimonials':
        return { items: [] };
      case 'faq':
        return { items: [] };
      case 'stats':
        return { items: [] };
      case 'team':
        return { items: [] };
      case 'services':
        return { items: [] };
      case 'contact':
        return { title: '', description: '', fields: ['name', 'email', 'message'] };
      case 'timeline':
        return { items: [] };
      default:
        return {};
    }
  };

  const updateBlock = (id, data) => {
    updateBlocks(blocks.map(block => 
      block.id === id ? { ...block, data } : block
    ));
  };

  const deleteBlock = (id) => {
    updateBlocks(blocks.filter(block => block.id !== id));
  };

  const moveBlock = (fromIndex, toIndex) => {
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, removed);
    updateBlocks(newBlocks);
  };

  const renderBlock = (block, index) => {
    const commonProps = {
      key: block.id,
      data: block.data,
      onChange: (data) => updateBlock(block.id, data),
      onDelete: () => deleteBlock(block.id),
      onMoveUp: index > 0 ? () => moveBlock(index, index - 1) : null,
      onMoveDown: index < blocks.length - 1 ? () => moveBlock(index, index + 1) : null,
    };

    switch (block.type) {
      case 'heading':
        return <BlockHeading {...commonProps} />;
      case 'tiptap':
        return <BlockTipTap {...commonProps} />;
      case 'text':
        return <BlockText {...commonProps} />;
      case 'image':
        return <BlockImage {...commonProps} />;
      case 'video':
        return <BlockVideo {...commonProps} />;
      case 'carousel':
        return <BlockCarousel {...commonProps} />;
      case 'gallery':
        return <BlockGallery {...commonProps} />;
      case 'iframe':
        return <BlockIframe {...commonProps} />;
      case 'button':
        return <BlockButton {...commonProps} />;
      case 'cta':
        return <BlockCTA {...commonProps} />;
      case 'hero':
        return <BlockHero {...commonProps} />;
      case 'accordion':
        return <BlockAccordion {...commonProps} />;
      case 'tabs':
        return <BlockTabs {...commonProps} />;
      case 'testimonials':
        return <BlockTestimonials {...commonProps} />;
      case 'faq':
        return <BlockFAQ {...commonProps} />;
      case 'stats':
        return <BlockStats {...commonProps} />;
      case 'team':
        return <BlockTeam {...commonProps} />;
      case 'services':
        return <BlockServices {...commonProps} />;
      case 'contact':
        return <BlockContact {...commonProps} />;
      case 'timeline':
        return <BlockTimeline {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Block Button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add to content
      </button>

      {/* Blocks */}
      {blocks.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          {placeholder}
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          {renderBlock(block, index)}
        </div>
      ))}

      {/* Add Block Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Content Block</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {BLOCK_TYPES.map((blockType) => {
                const Icon = blockType.icon;
                return (
                  <button
                    key={blockType.id}
                    type="button"
                    onClick={() => addBlock(blockType.id)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{blockType.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockContentEditor;

