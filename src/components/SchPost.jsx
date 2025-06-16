import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPages } from '../store/pagesSlice';
import LogoutButton from './LogoutButton';
import PageSelector from './PageSelector';

const SchPost = () => {
  const dispatch = useDispatch();
  const pages = useSelector((state) => state.pages.pages);
  const user = useSelector((state) => state.pages.user);

  const [selectedPage, setSelectedPage] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('photo');

  // Redirect to Facebook login with user_id as query param
  const handleFacebookLogin = () => {
    if (!user || !user._id) {
      alert('Please login first.');
      return;
    }
    window.location.href = `http://localhost:5000/auth/facebook?user_id=${user._id}`;
  };

  // Fetch pages after Facebook login
  const fetchPages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/auth/facebook/pages', {
        withCredentials: true,
      });
      console.log('Fetched pages:', res.data.pages);
      dispatch(setPages(res.data.pages));
    } catch (err) {
      console.error('Error fetching pages:', err);
    }
  };

  useEffect(() => {
    fetchPages();
    
  }, []);

  const handleSchedulePost = async () => {
    if (!mediaFile) return alert('Please select a media file.');
    if (!selectedPage) return alert('Select a valid page.');
    if (!scheduledTime) return alert('Select a scheduled time.');

    const timestamp = Math.floor(new Date(scheduledTime).getTime() / 1000);
    const formData = new FormData();
    formData.append('pageId', selectedPage);
    formData.append('message', message);
    formData.append('scheduledTime', timestamp);
    formData.append('mediaType', mediaType);
    formData.append('file', mediaFile);

    try {
      const res = await axios.post('http://localhost:5000/schedulePost/timing', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      alert('Scheduled Post ID: ' + res.data.postId);
    } catch (err) {
      console.error(err);
      alert('Failed to schedule post: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePostNow = async () => {
    if (!mediaFile) return alert('Please select a media file.');
    if (!selectedPage) return alert('Select a valid page.');

    const formData = new FormData();
    formData.append('pageId', selectedPage);
    formData.append('message', message);
    formData.append('mediaType', mediaType);
    formData.append('file', mediaFile);

    try {
      const res = await axios.post('http://localhost:5000/schedulePost/instantly', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      alert('Post ID: ' + res.data.postId);
    } catch (err) {
      console.error(err);
      alert('Failed to post instantly: ' + (err.response?.data?.error || err.message));
    }
  };

  const getAllPosts = async () => {
    if (!selectedPage) return alert('Select a valid page.');
    try {
      const res = await axios.get('http://localhost:5000/posts/getallposts', {
        params: { pageId: selectedPage },
        withCredentials: true,
      });
      console.log('Fetching posts for page:', selectedPage);
      console.log('Posts:', res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      alert('Failed to fetch posts: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {pages.length === 0 ? (
        <button
          onClick={handleFacebookLogin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login with Facebook
        </button>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Schedule a Facebook Post</h2>

          <label className="block mb-2 text-sm font-medium text-gray-700">Select Page</label>
          <select
            onChange={e => setSelectedPage(e.target.value)}
            value={selectedPage}
            className="w-full mb-4 border border-gray-300 rounded-lg p-2"
          >
            <option value="">-- Choose a Page --</option>
            {pages.map(page => (
              <option key={page.id} value={page.id}>{page.name}</option>
            ))}
          </select>

          <label className="block mb-2 text-sm font-medium text-gray-700">Message / Caption</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full mb-4 border rounded-lg p-2 h-24"
            placeholder="Write your post message or caption..."
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">Media Type</label>
          <select
            value={mediaType}
            onChange={e => setMediaType(e.target.value)}
            className="w-full mb-4 border rounded-lg p-2"
          >
            <option value="photo">Photo</option>
            <option value="video">Video</option>
          </select>

          <label className="block mb-2 text-sm font-medium text-gray-700">Upload Media</label>
          <input
            type="file"
            accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
            onChange={e => setMediaFile(e.target.files[0])}
            className="w-full mb-6"
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">Schedule Time</label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={e => setScheduledTime(e.target.value)}
            className="w-full mb-6 border rounded-lg p-2"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSchedulePost}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Schedule Later
            </button>
            <button
              onClick={handlePostNow}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Post Now
            </button>
            <button
              onClick={getAllPosts}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Get All Posts
            </button>
            <LogoutButton />
            <PageSelector/>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchPost;