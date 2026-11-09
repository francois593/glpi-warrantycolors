<?php
declare(strict_types=1);

namespace GlpiPlugin\Warrantycolors\Export;

use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

final class WarrantyExportLimit
{
    public static function assertAllowed(mixed $count, int $maximum): void
    {
        if ($maximum < 1) {
            throw new InvalidArgumentException('Invalid export limit');
        }

        if (
            (!is_int($count)
                && !(is_string($count) && ctype_digit($count)))
            || (int) $count < 0
        ) {
            throw new RuntimeException(
                'Unable to determine export result count'
            );
        }

        if ((int) $count > $maximum) {
            throw new UnprocessableEntityHttpException(
                'Warranty Colors: export exceeds '
                . $maximum . ' computers. '
                . 'Refine the search or export the current page.'
            );
        }
    }
}
