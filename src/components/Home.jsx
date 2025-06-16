import { NavLink } from "react-router-dom";

export default function Home() {
  return (
    <div className="App">
      <NavLink to={"/schedulePost"}>
      <button>
      Login with Facebook
     </button>
      </NavLink>
     
    </div>
  );
}