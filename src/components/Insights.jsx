import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPages, setPostsByPage } from '../store/pagesSlice';

export default function Insights() {
  const dispatch = useDispatch();
  const pages = useSelector((state) => state.pages.pages);
  const postsByPage = useSelector((state) => state.pages.postsByPage);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [insights, setInsights] = useState(null);
  const [insightType, setInsightType] = useState(''); // 'page' or 'post'

  const fetchPages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/auth/facebook/pages', {
        withCredentials: true,
      });
      dispatch(setPages(res.data.pages));
    } catch (err) {
      console.error('Error fetching pages:', err);
      alert('Failed to fetch pages');
    }
  };

  const fetchPagePosts = async (pageId, pageName) => {
    try {
      const res = await axios.get('http://localhost:5000/posts/getallposts', {
        params: { pageId },
        withCredentials: true,
      });
      dispatch(setPostsByPage({ pageName, posts: res.data.posts }));
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchPostInsights = async (postId) => {
    try {
      const res = await axios.get('http://localhost:5000/insights/post', {
        params: { postId },
        withCredentials: true,
      });
      setInsights(res.data);
      setInsightType('post');
    } catch (err) {
      console.error('Error fetching post insights:', err.response?.data || err.message);
    }
  };

  const fetchPageInsights = async (pageId) => {
    try {
      const res = await axios.get('http://localhost:5000/insights/page', {
        params: {
          pageId,
          metrics: 'page_impressions,page_engaged_users', // Add more metrics as needed
        },
        withCredentials: true,
      });
      setInsights(res.data);
      setInsightType('page');
    } catch (err) {
      console.error('Error fetching page insights:', err.response?.data || err.message);
    }
  };

  const handlePageSelect = (e) => {
    const selectedId = e.target.value;
    const page = pages.find((p) => p.id === selectedId || p.pageId === selectedId);
    setSelectedPage(page);
    fetchPagePosts(page.id || page.pageId, page.name);
    setSelectedPostId('');
    setInsights(null);
    setInsightType('');
  };

  const handlePostSelect = (e) => {
    const postId = e.target.value;
    setSelectedPostId(postId);
    fetchPostInsights(postId);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="insights">
      <h1>Page & Post Insights</h1>

      {/* Page Dropdown */}
      <select onChange={handlePageSelect} defaultValue="">
        <option value="" disabled>Select a Page</option>
        {pages.map((page) => (
          <option key={page.id || page.pageId} value={page.id || page.pageId}>
            {page.name}
          </option>
        ))}
      </select>

      {/* Fetch Page Insights Button */}
      {selectedPage && (
        <button
          style={{
            margin: '1rem 0',
            padding: '0.5rem 1rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => fetchPageInsights(selectedPage.id || selectedPage.pageId)}
        >
          Fetch Page Insights
        </button>
      )}

      {/* Post Dropdown */}
      {selectedPage && postsByPage[selectedPage.name] && (
        <>
          <h3 style={{ marginTop: '1rem' }}>Select a Post:</h3>
          <select onChange={handlePostSelect} value={selectedPostId}>
            <option value="" disabled>Select a Post</option>
            {postsByPage[selectedPage.name].map((post) => (
              <option key={post.id || post.postId} value={post.id || post.postId}>
                {post.message ? post.message.slice(0, 50) : '[No Text Post]'}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Insights */}
      {insights && (
        <div style={{ marginTop: '1rem' }}>
          <h3>{insightType === 'page' ? 'Page Insights' : 'Post Insights'}</h3>
          <pre>{JSON.stringify(insights, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
