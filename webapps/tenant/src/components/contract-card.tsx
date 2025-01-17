import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { AmountValue } from '@/components/amount-value';
import { Button } from './ui/button';
import { getFormatNumber } from '@/utils/formatnumber';
import { getMoment } from '@/utils';
import getTranslation from '@/utils/i18n/server/getTranslation';
import { InvoiceTable } from '@/components/invoice-table';
import { LabelValue } from '@/components/label-value';
import type { Lease } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';
import ContactCard from './contact-card';

export async function ContractCard({ lease }: { lease: Lease }) {
  const { locale, t } = await getTranslation();
  const moment = getMoment(locale);
  const formatNumber = getFormatNumber(locale, lease.landlord.currency);

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="uppercase">{lease.tenant.name}</div>
              <div className="font-normal">
                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      variant="link"
                      className="text-muted-foreground font-semibold ml-2 p-0 pt-1"
                    >
                      <Info size={20} strokeWidth={2.5} />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <ContactCard variant="tenant" contactInfo={lease.tenant} />
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
            <StatusBadge variant={lease.status}>
              {lease.status === 'active' ? t('In progress') : t('Terminated')}
            </StatusBadge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-6 mb-6">
          <div className="flex flex-col grow">
            <div className="grow text-2xl">{lease.name}</div>
            <div className="flex content-center items-center">
              <div className="text-muted-foreground uppercase text-sm font-semibold">
                {lease.landlord.name}
              </div>
              <div>
                <HoverCard>
                  <HoverCardTrigger>
                    <Button
                      variant="link"
                      className="text-muted-foreground font-semibold ml-1 p-0"
                    >
                      <Info size={20} strokeWidth={2.5} />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <ContactCard
                      variant="landlord"
                      contactInfo={lease.landlord}
                    />
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <Card className="shadow w-44">
              <CardContent>
                <AmountValue
                  className="mt-6"
                  label={t('Deposit')}
                  value={formatNumber({ value: lease.deposit })}
                />
              </CardContent>
            </Card>
            <Card className="shadow w-44">
              <CardContent>
                <AmountValue
                  className="mt-6"
                  variant={lease.balance > 0 ? 'success' : 'destructive'}
                  label={t('Balance')}
                  value={formatNumber({ value: lease.balance })}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex content-center gap-6 mb-6">
          <Card className="shadow w-1/3">
            <CardContent className="flex flex-col gap-3 mt-6 ">
              <LabelValue
                label={t('Start date')}
                value={
                  lease.beginDate ? moment(lease.beginDate).format('LL') : '-'
                }
              />
              {!lease.terminationDate ? (
                <LabelValue
                  label={t('End date')}
                  value={
                    lease.endDate ? moment(lease.endDate).format('LL') : '-'
                  }
                />
              ) : (
                <LabelValue
                  label={t('Termination date')}
                  value={moment(lease.terminationDate).format('LL')}
                />
              )}
            </CardContent>
          </Card>
          <Card className="shadow w-2/3">
            <CardContent className="mt-6">
              <LabelValue
                label={t('Properties')}
                value={lease.properties.map(({ name }) => name).join(', ')}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow">
          <CardContent className="mt-6">
            <InvoiceTable lease={lease} />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
