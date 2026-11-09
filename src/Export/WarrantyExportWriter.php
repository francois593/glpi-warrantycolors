<?php
declare(strict_types=1);

namespace GlpiPlugin\Warrantycolors\Export;

use DateTimeImmutable;
use LogicException;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\IWriter;

/**
 * Applies Warranty Colors immediately before native serialization.
 * The underlying PhpSpreadsheet writer remains responsible
 * for generating the document.
 */
final class WarrantyExportWriter implements IWriter
{
    private ?IWriter $inner = null;
    private array $columns = [];
    private ?DateTimeImmutable $today = null;

    public function __construct(
        private readonly Spreadsheet $workbook
    ) {
    }

    public function configure(
        IWriter $writer,
        array $columns,
        DateTimeImmutable $today
    ): void {
        if ($writer === $this) {
            throw new LogicException('Recursive writer');
        }

        $this->inner = $writer;
        $this->columns = $columns;
        $this->today = $today;
    }

    private function writer(): IWriter
    {
        return $this->inner
            ?? throw new LogicException('Writer not configured');
    }

    public function save($filename, int $flags = 0): void
    {
        if ($this->today === null) {
            throw new LogicException('Missing reference date');
        }

        WarrantyExportStyler::apply(
            $this->workbook,
            $this->columns,
            $this->today
        );

        // CSV formula protection. Other formats remain unchanged.
        if ($this->writer() instanceof
            \PhpOffice\PhpSpreadsheet\Writer\Csv) {
            $this->protectCsvValues();
        }

        $this->writer()->save($filename, $flags);
    }

    /**
     * Prevent spreadsheet applications from evaluating CSV text
     * fields as formulas.
     */
    private function protectCsvValues(): void
    {
        $sheet = $this->workbook->getActiveSheet();

        foreach ($sheet->getRowIterator() as $row) {
            $cells = $row->getCellIterator();
            $cells->setIterateOnlyExistingCells(true);

            foreach ($cells as $cell) {
                if (
                    $cell === null
                    || $cell->getDataType() !==
                        \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING
                ) {
                    continue;
                }

                $value = $cell->getValue();

                if (!is_string($value)) {
                    continue;
                }

                $unsafe = preg_match(
                    '/^[\x00-\x20\x{00A0}\x{FEFF}]*[=+\-@]/u',
                    $value
                );

                if ($unsafe === 1) {
                    $cell->setValueExplicit(
                        "'" . $value,
                        \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING
                    );
                }
            }
        }
    }

    public function getIncludeCharts(): bool
    {
        return $this->writer()->getIncludeCharts();
    }

    public function setIncludeCharts(bool $includeCharts): self
    {
        $this->writer()->setIncludeCharts($includeCharts);
        return $this;
    }

    public function getPreCalculateFormulas(): bool
    {
        return $this->writer()->getPreCalculateFormulas();
    }

    public function setPreCalculateFormulas(
        bool $precalculateFormulas
    ): self {
        $this->writer()->setPreCalculateFormulas(
            $precalculateFormulas
        );
        return $this;
    }

    public function getUseDiskCaching(): bool
    {
        return $this->writer()->getUseDiskCaching();
    }

    public function setUseDiskCaching(
        bool $useDiskCache,
        ?string $cacheDirectory = null
    ): self {
        $this->writer()->setUseDiskCaching(
            $useDiskCache,
            $cacheDirectory
        );
        return $this;
    }

    public function getDiskCachingDirectory(): string
    {
        return $this->writer()->getDiskCachingDirectory();
    }
}
