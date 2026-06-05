import app from "./core/app";
import { connexion } from "./core/database/mongose";
import { config } from "./core/env";


const launch = async () => {
    const PORT = config.port || 3000;
    await connexion();
    app.listen(PORT, () => {
        console.log(`Server is running on PORT ${PORT}`);
    })
}

launch();
