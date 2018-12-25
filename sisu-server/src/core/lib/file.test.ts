import { createFileId } from "./file";

describe("core file", () => {
    describe("createFileId", () => {
        it("should be deterministic", () => {
            const id1 = createFileId("/path/to/file.txt");
            const id2 = createFileId("/path/to/file.txt");

            expect(id1).toEqual(id2);
        });

        it("should normalize path", () => {
            const id1 = createFileId("/path/to/file.txt");
            const id2 = createFileId("\\path\\to\\file.txt");

            expect(id1).toEqual(id2);
        });
    });
});
