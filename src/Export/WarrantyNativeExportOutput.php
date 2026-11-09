<?php
declare(strict_types=1);

namespace GlpiPlugin\Warrantycolors\Export;

use DateTimeImmutable;
use InvalidArgumentException;
use Glpi\Search\Output\Spreadsheet as NativeSpreadsheet;

/**
 * Reuses GLPI's original spreadsheet renderer and writer.
 *
 * No modification of GLPI core files.
 */
final class WarrantyNativeExportOutput extends NativeSpreadsheet
{
    private WarrantyExportWriter $bridge;

    public function __construct(
        private readonly NativeSpreadsheet $native,
        private readonly DateTimeImmutable $today
    ) {
        parent::__construct();

        // Use the workbook already configured by GLPI's writer.
        $this->spread = $native->getSpreasheet();

        $this->bridge = new WarrantyExportWriter($this->spread);

        $this->writer = $this->bridge;

        $this->configureColumns([]);
    }

    public function configureColumns(array $columns): void
    {
        $this->bridge->configure(
            $this->native->getWriter(),
            $columns,
            $this->today
        );
    }

    public function displayData(array $data, array $params = [])
    {
        if (($data['itemtype'] ?? null) !== 'Computer') {
            throw new InvalidArgumentException(
                'Warranty export is restricted to Computer'
            );
        }

        if (!isset($data['data']['cols'])
            || !is_array($data['data']['cols'])) {
            throw new InvalidArgumentException(
                'Missing native GLPI column definitions'
            );
        }

        $this->configureColumns($data['data']['cols']);

        // Native GLPI method creates all rows, columns and metadata.
        return parent::displayData($data, $params);
    }

    public function getMime(): string
    {
        return $this->native->getMime();
    }

    public function getFileName(): string
    {
        return $this->native->getFileName();
    }
}
