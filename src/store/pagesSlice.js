import { createSlice } from '@reduxjs/toolkit';
const pagesSlice = createSlice({
  name: 'pages',
  initialState: {
    pages: [],
    selectedPage: null,
    user:{"_id":"6848796dbf37871f362aeef1"},
    postsByPage: {}, // New: pageName => [posts]
  },
  reducers: {
    setPages: (state, action) => {
      state.pages = action.payload;
    },
    clearPages: (state) => {
      state.pages = [];
    },
    setSelectedPage: (state, action) => {
      state.selectedPage = action.payload;
    },
    clearSelectedPage: (state) => {
      state.selectedPage = null;
    },
    setPostsByPage: (state, action) => {
      const { pageName, posts } = action.payload;
      console.log(`Setting posts for page: ${pageName}`, posts);
      state.postsByPage[pageName] = posts;
    },
    clearPostsByPage: (state) => {
      state.postsByPage = {};
    },
  }
});

export const {
  setPages,
  clearPages,
  setSelectedPage,
  clearSelectedPage,
  setPostsByPage,
  clearPostsByPage,
} = pagesSlice.actions;

export default pagesSlice.reducer;
