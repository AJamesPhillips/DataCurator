import { h } from "preact"
import { useState } from "preact/hooks"

import { LinkButton } from "../../sharedf/Link"
import { remove_index } from "../../utils/list"
import type { BulkImportSettings, Model } from "./interfaces"
import { ObjectBulkImportModel } from "./ObjectBulkImportModel"


const airtable_data_sync_settings_key = "airtable_data_sync_settings"


export function ObjectBulkImportSetup ()
{
    const _settings = get_bulk_import_settings()
    const [settings, _set_settings] = useState(_settings)
    const { auth_key, app, models } = settings

    function set_settings (new_settings: Partial<BulkImportSettings>)
    {
        _set_settings({ ...settings, ...new_settings })
        save_bulk_import_settings({ ...settings, ...new_settings })
    }


    function factory_model_change_handlers (index: number)
    {
        const on_change = (field: keyof Model) => (value: string) =>
        {
            const new_models = [...models]
            new_models[index] = {
                ...new_models[index]!,
                [field]: value
            }

            set_settings({ models: new_models })
        }

        return on_change
    }


    return <div>
        <b>Object Bulk Import</b>

        {/* <LinkButton
            route="objects"
            sub_route="objects_bulk_import"
            item_id={undefined}
            args={undefined}
            name="Bulk import"
            style={{ float: "right" }}
        /> */}

        <br /><br />

        <hr />

        <b>Setup AirTable bulk data import</b>

        <br />

        All of these fields will be stored securely and only accessible on this page.

        <br /><br />


        AirTable auth key:
        <input
            type="password"
            value={auth_key}
            onChange={e => set_settings({ auth_key: e.currentTarget.value })}
        ></input>

        <br />

        AirTable app:
        <input
            type="text"
            value={app}
            onChange={e => set_settings({ app: e.currentTarget.value })}
        ></input>

        <hr />

        Models ({models.length})

        {models.map((model, index) =>
            <ObjectBulkImportModel
                {...model}
                on_change={factory_model_change_handlers(index)}
                delete={() => set_settings({ models: remove_index(models, index) })}
            />)}

        &nbsp;

        <input type="button" value="Add model" onClick={() => set_settings({ models: [...models, new_model()] })} />

        <br />

        <hr />

        <LinkButton
            route="objects"
            sub_route="objects_bulk_import"
            item_id={undefined}
            args={undefined}
            name="Finished setup"
        />

    </div>
}


function new_model (): Model
{
    return { name: "", table_id: "", view_id: "", pattern_id: "" }
}



function save_bulk_import_settings (args: BulkImportSettings)
{
    localStorage.setItem(airtable_data_sync_settings_key, JSON.stringify(args))
}


export function get_bulk_import_settings (): BulkImportSettings
{
    const airtable_data_sync_settings = localStorage.getItem(airtable_data_sync_settings_key) || "{}"
    const {
        auth_key = "",
        app = "",
        models = [],
    } = JSON.parse(airtable_data_sync_settings)

    return {
        auth_key: auth_key as string,
        app: app as string,
        models: models as Model[],
    }
}
