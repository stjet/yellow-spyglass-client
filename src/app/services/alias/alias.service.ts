import { ApiService } from '@app/services/api/api.service';
import { AliasDto } from '@app/types/dto';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
/** Fetches account aliases on initialization. */
export class AliasService {
    public aliases: AliasDto[] = [];

    private readonly aliasesMap: Map<string, { alias: string; socialMedia: string; platformUserId: string }>;
    private readonly searchAccounts: Set<string>;

    constructor(private readonly _api: ApiService) {
        this.aliasesMap = new Map();
        this.searchAccounts = new Set();
        this._loadAliases();
    }

    /** Loads a minified address/alias pair for quick searching. */
    private _loadAliases(): void {
        this._api
            .fetchAliases()
            .then((data: AliasDto[]) => {
                this.aliases.push(...data);
                for (const account of data) {
                    this.aliasesMap.set(account.address, {
                        alias: account.alias,
                        socialMedia: undefined,
                        platformUserId: undefined,
                    });
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /** Given a set of addresses, makes a series of calls to see if there's any social media data around these accounts. */
    fetchSocialMediaAliases(addresses: Set<string>): void {
        if (!environment.brpd) {
            return;
        }
        addresses.forEach((address) => {
            if (address && !this.searchAccounts.has(address) && !this.aliasesMap.has(address)) {
                this.searchAccounts.add(address);
                this._api
                    .fetchSocialMediaAccount(address)
                    .then((data) => {
                        if (data.alias) {
                            //      this.aliases.push(data); // Add social to search bar results.
                            this.aliasesMap.set(address, {
                                alias: data.alias,
                                socialMedia: data.platform,
                                platformUserId: data.platformUserId,
                            });
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        });
    }

    /* TODO: Remove me. */
    has(address: string): boolean {
        return this.aliasesMap.has(address);
    }

    getAlias(address: string): string {
        if (this.has(address)) {
            return this.aliasesMap.get(address).alias;
        }
        this.fetchSocialMediaAliases(new Set([address]));
    }

    getSocialMediaUserId(address: string): string {
        if (this.has(address)) {
            return this.aliasesMap.get(address).platformUserId;
        }
    }

    getSocialMedia(address: string): string {
        if (this.has(address)) {
            return this.aliasesMap.get(address).socialMedia;
        }
    }

    get(address: string): { alias: string; socialMedia: string } {
        return this.aliasesMap.get(address);
    }
}
