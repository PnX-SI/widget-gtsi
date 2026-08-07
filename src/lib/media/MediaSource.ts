import { Connector } from '../connectors/connector';
import { Media } from '../models';
import { SOURCE_ } from './media';

export abstract class MediaSource {
    name: string;
    id: SOURCE_;

    constructor(name: string, id: SOURCE_) {
        this.name = name;
        if (!Object.values(SOURCE_).includes(id)) {
            throw new Error(
                'Source identifier is not declared in `mediaIdentifier.js`'
            );
        }
        this.id = id;
    }

    abstract isCompatible(connector: Connector): boolean;

    fetchPicture(
        taxonID: string | number,
        connector: Connector
    ): Promise<Media[] | undefined> {
        if (!this.isCompatible(connector)) {
            throw new Error('This media source is not available!');
        }
        throw new Error('Not implemented');
    }

    fetchSound(
        taxonID: string | number,
        connector: Connector
    ): Promise<Media[] | undefined> {
        if (!this.isCompatible(connector)) {
            throw new Error('This media source is not available!');
        }
        return new Promise((_) => null);
    }

    /**
     * Returns the credits for a given media item. Used when the media
     * are fetched without credits information,
     * to enrich them with the necessary details to be displayed in the UI.
     * @param {Media} media - The media item.
     * @returns {Promise<Media>} The media item with credits information.
     */
    getCredits(media: Media): Promise<Media> {
        throw new Error('Not implemented');
    }
}
