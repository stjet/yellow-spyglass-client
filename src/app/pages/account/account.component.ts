import { ChangeDetectorRef, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AccountNFTDto, AccountOverviewDto } from '@app/types/dto';
import { ViewportService } from '@app/services/viewport/viewport.service';
import { UtilService } from '@app/services/util/util.service';
import { ApiService } from '@app/services/api/api.service';
import { MonkeyCacheService } from '@app/services/monkey-cache/monkey-cache.service';
import { PriceService } from '@app/services/price/price.service';
import { OnlineRepsService } from '@app/services/online-reps/online-reps.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AliasService } from '@app/services/alias/alias.service';
import { APP_NAV_ITEMS, accountNavItem, hashNavItem } from '../../navigation/nav-items';
import { environment } from '../../../environments/environment';
import { DelegatorsTabService } from '@app/pages/account/tabs/delegators/delegators-tab.service';
import { InsightsTabService } from '@app/pages/account/tabs/insights/insights-tab.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';

@Component({
    selector: 'app-account',
    templateUrl: 'account.component.html',
    styleUrls: ['account.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AccountComponent implements OnDestroy {
    MAX_INSIGHTS = 100_000;

    nfts: AccountNFTDto[];
    isLoadingNFTs: boolean;
    address: string;
    confirmedBalance: number;
    accountRepresentative: string;

    badAccount: boolean;
    showFilter: boolean;
    hasError: boolean;
    hasNFTsError: boolean;
    isBRPD = environment.brpd;

    delegatorCount: number;
    shownTabNumber: number;

    DEFAULT_BRPD_TX_SIZE = this.vp.sm ? 50 : 250;
    DEFAULT_TX_SIZE = 50;
    navItems = APP_NAV_ITEMS;
    routeListener: Subscription;
    accountOverviewListener: Subscription;
    accountOverview: AccountOverviewDto;

    isCompact = environment.brpd;

    borderRadius: 16;

    constructor(
        public vp: ViewportService,
        public apiService: ApiService,
        public onlineRepService: OnlineRepsService,
        private readonly _router: Router,
        private readonly _util: UtilService,
        private readonly _priceService: PriceService,
        private readonly _ref: ChangeDetectorRef,
        private readonly _monkeyCache: MonkeyCacheService,
        private readonly _aliasService: AliasService,
        private readonly _txTabService: TransactionsService,
        private readonly _insightsTabService: InsightsTabService,
        private readonly _delegatorsTabService: DelegatorsTabService
    ) {
        this.routeListener = this._router.events.subscribe(async (route) => {
            if (route instanceof NavigationEnd) {
                const splitUrl = this._router.url.replace('/history', '').split('/');
                const path = splitUrl[splitUrl.length - 1];
                const address = path.substring(0, 64);
                await this._searchAccount(address);
            }
        });

        this.accountOverviewListener = this.apiService.accountLoadedSubject.subscribe((overview) => {
            this._prepareNewAccount(overview);
        });
    }

    ngOnDestroy(): void {
        if (this.routeListener) {
            this.routeListener.unsubscribe();
        }
        if (this.accountOverviewListener) {
            this.accountOverviewListener.unsubscribe();
        }
    }

    /** Call this method whenever a new address is searched. */
    private _resetPage(): void {
        this.address = undefined;
        this.badAccount = false;
        this.accountOverview = undefined;
        this.hasError = false;
        this.shownTabNumber = 1;
        this.delegatorCount = 0;
        this.confirmedBalance = 0;
        this.nfts = undefined;
        this.isLoadingNFTs = false;
        this.hasNFTsError = false;

        // Managing tabs state.  Reset them all.
        this._txTabService.forgetAccount();
        this._insightsTabService.forgetAccount();
        this._delegatorsTabService.forgetAccount();
    }

    /** Call this method whenever someone has accidently routed to the hash page, but with an address. */
    private _redirectToHashPage(hash: string): void {
        void this._router.navigate([`/${hashNavItem.route}/${hash}`], { replaceUrl: true });
    }

    /** Call this method whenever someone has enters a BNS domain, and it is resolved to a Banano address. */
    private _redirectToAccountPage(account: string): void {
        void this._router.navigate([`/${accountNavItem.route}/${account}`], { replaceUrl: true });
    }

    /** Given a ban address, searches for account. */
    private async _searchAccount(address): Promise<void> {
        if (!address) {
            return;
        }

        if (!address.startsWith('ban_')) {
            //if not a banano address, and is in the format <string>.<string>, search in api
            if (this._util.isValidBNSDomain(address)) {
                //search in api
                try {
                    const parts = address.split('.');
                    const domain = await this.apiService.fetchBNSDomain(parts[0], parts[1]);
                    if (domain.domain?.resolved_address) {
                        return this._redirectToAccountPage(domain.domain?.resolved_address);
                    }
                } catch (_) {}
            }
            //if not in that format, or not found in api, assume it is a block hash
            this._redirectToHashPage(address);
        }

        this._resetPage();
        this.address = address;
        this._ref.detectChanges();

        const pageSize = this.isBRPD ? this.DEFAULT_BRPD_TX_SIZE : this.DEFAULT_TX_SIZE;

        // Fetch receivable tx
        void this._txTabService.loadReceivableTransactions(address);

        this._txTabService.address = address;
        this._txTabService.setFilters(this._txTabService.createNewFilterObject());

        // Fetch overview & confirmed transactions.  An event is emitted when account overview is loaded.
        void Promise.all([
            this.apiService.fetchAccountOverview(address),
            this._txTabService.loadConfirmedTransactionsPage(0, pageSize),
        ]).catch((err) => {
            // Check bad account number
            if (err.error && err.error.error && err.error.error.toLowerCase().includes('bad account')) {
                this.badAccount = true;
            }
            console.error(err);
            this.hasError = true;
        });

        // Load delegators ahead of time so we can get the weighted delegators count as well.
        void this._delegatorsTabService.fetchDelegators(address, true).then(() => {
            const weightedDelegatorsCount = this._delegatorsTabService.getWeightedDelegatorsCount();
            this.delegatorCount = weightedDelegatorsCount;
        });
    }

    /** Called whenever a new address has been loaded. */
    private _prepareNewAccount(accountOverview: AccountOverviewDto): void {
        this.accountOverview = accountOverview;

        if (!this.delegatorCount) {
            this.delegatorCount = accountOverview.delegatorsCount;
        }

        if (!this.accountOverview.opened) {
            return;
        }

        this.confirmedBalance = this.accountOverview.balance;

        const rep = this.accountOverview.representative;
        if (rep) {
            this.accountRepresentative =
                this._aliasService.getAlias(rep) || `${rep.substr(0, 11)}...${rep.substr(rep.length - 6, rep.length)}`;
        }
    }

    /** Returns true if an account is considered a representative.  Must be opened with at least 1 delegator. */
    isRepresentative(): boolean {
        return this.accountOverview && this.accountOverview.opened && this.accountOverview.weight > 0;
    }

    /** Converts a raw to a USD amount. */
    formatUsdPrice(raw: string): number {
        const ban = this._util.convertRawToBan(raw, { precision: 2, comma: false });
        const price = this._priceService.priceInUSD(Number(ban));
        if (price > 100000) {
            return Math.round(price);
        }
        return price;
    }

    /** Converts a raw amount to a bitcoin amount. */
    formatBtcPrice(raw: string): string {
        const ban = this._util.convertRawToBan(raw, { precision: 2, comma: false });
        return `₿${this._util.numberWithCommas(this._priceService.priceInBitcoin(Number(ban)).toFixed(4))}`;
    }

    goBack(): void {
        window.history.back();
    }

    /** Puts emphasis on the first & last bits of an address. */
    formatAccountAddress(address: string): string {
        if (address) {
            const firstBits = address.substring(0, 12);
            const midBits = address.substring(12, 58);
            const lastBits = address.substring(58, 64);
            return `<strong class="">${firstBits}</strong><span class="text-secondary">${midBits}</span><strong class="">${lastBits}</strong>`;
        }
    }

    getAlias(address: string): string {
        return this._aliasService.getAlias(address);
    }

    getRepresentativeLabel(): string {
        return this.accountOverview.principal
            ? this.vp.sm
                ? 'Principal Rep'
                : 'Principal Representative'
            : 'Representative';
    }

    getReceivableTransactionsCount(): number {
        return this._txTabService.receivableTransactions.length;
    }

    disableBodyScrollWhenOpen(): void {
        document.body.style.overflow = this.showFilter ? 'hidden' : 'auto';
    }

    showFilterActionButton(): boolean {
        return (
            this.accountOverview &&
            this.accountOverview.opened &&
            (this.accountOverview.blockCount <= this.MAX_INSIGHTS || this.isBRPD)
        );
    }

    fetchNfts(): void {
        if (this.nfts) {
            return;
        }
        if (this.isLoadingNFTs) {
            return;
        }

        this.nfts = [];
        this.isLoadingNFTs = true;
        this.apiService
            .fetchAccountNFTs(this.address)
            .then((data) => {
                this.nfts = data;
            })
            .catch((err) => {
                console.error(err);
                this.hasNFTsError = true;
            })
            .finally(() => {
                this.isLoadingNFTs = false;
            });
    }

    showCSVExportActionButton(): boolean {
        return (
            this.accountOverview && this.accountOverview.opened && this.accountOverview.blockCount <= this.MAX_INSIGHTS
        );
    }
}
