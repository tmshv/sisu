import { ObjectId } from "bson";

export function oid(id: string | ObjectId): ObjectId {
    try {
        return new ObjectId(id);
    } catch (e) {
        return undefined;
    }
}

export function resourceQuery(param: string | ObjectId): object {
    const id = oid(param);

    if (!id) {
        return {
            uri: param,
        };
    }

    return {
        _id: id,
    };
}
