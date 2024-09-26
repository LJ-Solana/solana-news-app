import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../lib/supabaseClient';
import CommentIcon from '@mui/icons-material/Comment';

interface Comment {
  id: number;
  user_address: string;
  content: string;
  created_at: string;
}

interface CommentBoxProps {
  articleId: string;
}

const CommentBox: React.FC<CommentBoxProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { publicKey } = useWallet();

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !newComment.trim()) return;

    const { error } = await supabase.from('comments').insert({
      article_id: articleId,
      user_address: publicKey.toString(),
      content: newComment.trim(),
    });

    if (error) {
      console.error('Error submitting comment:', error);
    } else {
      setNewComment('');
      fetchComments();
    }
  };

  const generateRandomColor = () => {
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <CommentIcon className="mr-2" />
        Anon Comments
      </h3>
      {publicKey ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
            rows={3}
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <p className="mb-4 text-yellow-400">Please connect your wallet to comment.</p>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-800 p-4 rounded-md flex">
            <div className="mr-4">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: generateRandomColor(),
                }}
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">
                {comment.user_address.slice(0, 6)}...{comment.user_address.slice(-4)} • {new Date(comment.created_at).toLocaleString()}
              </p>
              <p className="text-white">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentBox;
