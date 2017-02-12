

declare module "gdal" {

    interface GdalCollection<T> {
        count(): number;
        forEach(callback: (band: GdalRasterBand, i: number) => void);
        get(index): T;
        getNames(): string[]
        map(callback)
    }

    interface GdalDrivers extends GdalCollection<GdalDriver> {

    }
    interface GdalDriver {
        copyFiles(name_old, name_new)
        create(filename, x_size, y_size, band_count, data_type, creation_options?: string[]): Dataset
        createCopy(filename: string, src: Dataset, options?: string[])
        deleteDataset(filename)
        getMetadata(domain)
        open(path, mode)
        rename(new_nam, eold_name)
    }
    interface RasterBandPixels {
        get(x, y): number
        read<T extends Float32Array | Int32Array>(x, y, width, height, data?: T, options?): T
        readBlock(x, y, data)
        set(x, y, value)
        write(x, y, width, height, data?, options?)
        writeBlock(x, y, data)
    }
    interface GdalRasterBand {
        computeStatistics(allow_approximation)
        createMaskBand(flags)
        fill(real_value, imaginary_value)
        flush()
        getMaskBand()
        getMaskFlags()
        getMetadata(domain)
        getStatistics(allow_approximation, force)
        setStatistics(min, max, mean, std_dev)

        blockSize
        categoryNames
        colorInterpretation
        dataType
        description
        ds
        hasArbitraryOverviews
        id
        maximum
        minimum
        noDataValue
        offset
        overviews
        pixels: RasterBandPixels,
        readOnly
        scale
        size
        unitType
    }
    interface GdalDatasetBands extends GdalCollection<GdalRasterBand> {
        ds;
    }
    interface Dataset {
        buildOverviews(resampling, overviews, bands)
        close()
        executeSQL(statement, spatial_filter, dialect)
        flush()
        getFileList()
        getGCPProjection()
        getGCPs()
        getMetadata(domain)
        setGCPs(gcpsprojection)
        testCapability(capability)
        Attributes
        bands: GdalDatasetBands
        description
        driver
        geoTransform
        layers
        rasterSize
        srs
    }


    export const drivers: GdalDrivers;
    export const lastError: any;
    export const version: any;

    export function verbose();
    export function reprojectImage(options: { src: Dataset, dst: Dataset, s_srs: any, t_srs: any, resampling?: string, cutline?: any, srcBands?: number[], dstBands?: number[], srcAlphaBand?: number, dstAlphaBand?, srcNodata?, dstNodata?, memoryLimit?, maxError?, multi?, options?});



    export function open(path: string, mode?: string, drivers?: string[] | string, x_size?: number, y_size?: number, band_count?: number, data_type?: number, creation_options?: string[]): Dataset;


    export class SpatialReference {

    }


    export const GDT_Byte: string;
    export const GDT_CFloat32: string;
    export const GDT_CFloat64: string;
    export const GDT_CInt16: string;
    export const GDT_CInt32: string;
    export const GDT_Float32: string;
    export const GDT_Float64: string;
    export const GDT_Int16: string;
    export const GDT_Int32: string;
    export const GDT_UInt16: string;
    export const GDT_UInt32: string;
    export const GDT_Unknown: string;


    export const GRA_Lanczos: string;
}