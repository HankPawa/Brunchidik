import "./InstagramFeed.css";

const InstagramFeed = () => {
  return (
    <section className="instagram-section">
      
      <p className="instagram-subtitle">
        SÍGUENOS
      </p>

      <h2 className="instagram-title">
        @brunchandco
      </h2>

      <div className="instagram-wrapper">

        <iframe
          src="https://snapwidget.com/embed/1123655"
          className="snapwidget-widget"
          allowTransparency="true"
          frameBorder="0"
          scrolling="no"
          title="Instagram Feed"
        />

      </div>

    </section>
  );
};

export default InstagramFeed;