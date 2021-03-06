import React, { memo } from "react";

import { Block, Container } from "./components";

const HomePage = ({ global: { plugins }, history: { push } }) => {
  return (
    <>
      <Container className="container-fluid">
        <div className="row">
          <div className="col-12">
            <Block>
              <h2>CHA | Comunidad Homosexual Argentina</h2>
              <img src="https://cha-client.vercel.app/static/cha_logo-7c982ca74078df090deb95533e0afc59.png" />
            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
