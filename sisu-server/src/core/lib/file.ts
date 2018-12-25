import { compose } from "lodash/fp";
import { createShortHash } from "../../util/secure";
import { normalizePath } from "../../util";

export const createFileId = compose(
    createShortHash,
    normalizePath,
);
