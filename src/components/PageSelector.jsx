import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPages, setSelectedPage } from '../store/pagesSlice';

const PageSelector = () => {
  const dispatch = useDispatch();
  const pages = useSelector((state) => state.pages.pages);
  const selectedPage = useSelector((state) => state.pages.selectedPage);

  const handleSelect = (e) => {
    dispatch(setSelectedPage(e.target.value));
  };

  return (
    <select value={selectedPage || ''} onChange={handleSelect}>
      <option value="">Select a Page</option>
      {pages.map((page) => (
        <option key={page.id} value={page.id}>
          {page.name}
        </option>
      ))}
    </select>
  );
};

export default PageSelector;
