'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useTranslation from '@/utils/i18n/client/useTranslation';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

export default function MonthYearPicker({
  variant = 'monthyear',
  fromDate,
  toDate,
  onValueChange,
}: {
  variant: 'monthyear' | 'year';
  fromDate: Date;
  toDate: Date;
  onValueChange?: ({
    month,
    year,
  }: {
    month?: number | undefined;
    year: number;
  }) => void;
}) {
  const { locale, t } = useTranslation();
  const months = moment().locale(locale).localeData().months();
  const currentYear = moment().year();
  const years = useMemo(() => {
    const startYear = moment(fromDate).year();
    const endYear = moment(toDate).year();
    const years = [];
    for (let i = startYear; i <= endYear; i++) {
      years.push(i);
    }
    return years;
  }, [fromDate, toDate]);
  const [month, setMonth] = useState<number | undefined>();
  const [year, setYear] = useState<number>(currentYear);

  useEffect(() => {
    onValueChange?.({
      year: moment().year(),
    });
  }, []);

  const handleMonthChange = (value: string) => {
    setMonth(Number(value));
    onValueChange?.({
      month: Number(value),
      year,
    });
  };

  const handleYearChange = (value: string) => {
    setYear(Number(value));
    onValueChange?.({
      month,
      year: Number(value),
    });
  };

  return (
    <div className="flex gap-2">
      {variant === 'monthyear' ? (
        <Select defaultValue={String(-1)} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('Pick a month')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={String(-1)}>{t('All months')}</SelectItem>
            {months.map((month, index) => (
              <SelectItem key={month} value={String(index)}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <Select
        defaultValue={String(currentYear)}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('Pick a year')} />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={String(year)} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
