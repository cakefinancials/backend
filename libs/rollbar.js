/**
 * Helper file to configure rollbar for our package
 */

import { BOTTLE_NAMES } from "./bottle";

export function BOTTLE_FACTORY(container) {
    const envLib = container[BOTTLE_NAMES.LIB_ENV];
    const Rollbar = container[BOTTLE_NAMES.EXTERN_ROLLBAR];

    const ROLLBAR_ACCESS_TOKEN = envLib.getEnvVar("ROLLBAR_ACCESS_TOKEN");
    const stage = envLib.getEnvVar("MY_STAGE");

    const rollbar = new Rollbar({
        accessToken: ROLLBAR_ACCESS_TOKEN,
        captureUncaught: true,
        captureUnhandledRejections: true,
        enabled: stage !== "test",
        environment: stage,
        reportLevel: "warning", // same as default for now
        verbose: true,
    });

    return rollbar;
}
