define(['zuiRoot/common', 
    'zuiRoot/types', 
    'zuiRoot/logger',
    'zuiRoot/components'
], 
    function(common, types, logger, components){ 
        logger.subscribe('zui-all', 'zui-load', function(options) {
            logger.log('All ZUI modules loaded!', { tags: 'ZUI', logLevel:1 });
        });

        return {
            common: common,
            logger: logger,
            types: types,
            components: components
        }
    }
);