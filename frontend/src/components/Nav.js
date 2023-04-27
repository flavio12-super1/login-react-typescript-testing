import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./Lurker";
import spider from "./lurker-icons/spider.png";
import explore from "./lurker-icons/explore.png";
import bell from "./lurker-icons/bell.png";
import profile from "./lurker-icons/profile.png";
import "../styles/Nav.css";

function Nav() {
  const userData = useContext(UserContext);
  const { count, myEmail } = userData;

  return (
    <div id="outerNavDiv">
      <nav id="innerNavDiv">
        <div>
          <Link to="/lurker/" className="navStyle">
            <div className="divImg">
              <img className="navIcons" src={spider} alt="spider" />
            </div>
          </Link>
        </div>
        <div>
          <Link to="/lurker/explore" className="navStyle">
            <div className="divImg">
              <img className="navIcons" src={explore} alt="explore" />
            </div>
          </Link>
        </div>
        {/* start notifications */}
        <div>
          <Link to="/lurker/notifications" className="navStyle">
            <div className="divImg">
              <img className="navIcons bell" src={bell} alt="notifications" />
              {count > 0 ? <div id="notificationIcon">{count}</div> : null}
            </div>
          </Link>
        </div>
        {/* enednotifications  */}
        <div>
          <Link to={"/lurker/" + myEmail} className="navStyle">
            <div className="divImg">
              <img className="navIcons" src={profile} alt="profile" />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Nav;
