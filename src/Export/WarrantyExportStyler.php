<?php
declare(strict_types=1);

namespace GlpiPlugin\Warrantycolors\Export;

use DateTimeImmutable;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

final class WarrantyExportStyler
{
    private const COLORS = [
        'expired' => ['F8CCD2', 'A51D30'],
        'soon'    => ['FFE0B5', '96510B'],
        'valid'   => ['CFEBD5', '226B39'],
        'unknown' => ['E0E5EB', '526171'],
    ];

    public static function apply(
        Spreadsheet $workbook,
        array $columns,
        DateTimeImmutable $today
    ): bool {
        $position = null;

        foreach ($columns as $index => $column) {
            if (
                ($column['itemtype'] ?? null) === 'Computer'
                && (int) ($column['id'] ?? -1) === 120
            ) {
                $position = $index + 1;
                break;
            }
        }

        if ($position === null) {
            return false;
        }

        $sheet = $workbook->getActiveSheet();
        $letter = Coordinate::stringFromColumnIndex($position);

        $sheet->setCellValue(
            $letter . '1',
            'Expiration de la garantie'
        );

        $today = $today->setTime(0, 0, 0);
        $limit = $today->modify('+90 days');

        for ($row = 2; $row <= $sheet->getHighestDataRow(); $row++) {
            $address = $letter . $row;
            $cell = $sheet->getCell($address);
            $value = trim((string) $cell->getValue());

            $date = self::parseDate($value, $today);

            if ($date === null) {
                $state = 'unknown';

                if ($value === '' || $value === '—') {
                    $cell->setValue('Inconnue');
                }
            } elseif ($date < $today) {
                $state = 'expired';
            } elseif ($date <= $limit) {
                $state = 'soon';
            } else {
                $state = 'valid';
            }

            [$background, $foreground] = self::COLORS[$state];

            $style = $sheet->getStyle($address);

            $style->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()
                ->setARGB('FF' . $background);

            $style->getFont()
                ->getColor()
                ->setARGB('FF' . $foreground);
        }

        return true;
    }

    private static function parseDate(
        string $value,
        DateTimeImmutable $today
    ): ?DateTimeImmutable {
        foreach (['!Y-m-d', '!d/m/Y', '!d-m-Y'] as $format) {
            $date = DateTimeImmutable::createFromFormat(
                $format,
                $value,
                $today->getTimezone()
            );

            $errors = DateTimeImmutable::getLastErrors();

            if (
                $date instanceof DateTimeImmutable
                && (
                    $errors === false
                    || (
                        $errors['error_count'] === 0
                        && $errors['warning_count'] === 0
                    )
                )
            ) {
                return $date;
            }
        }

        return null;
    }
}
