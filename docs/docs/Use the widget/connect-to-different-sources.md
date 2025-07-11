---
sidebar_position: 3
---

# Different sources

## Connect to GeoNature

(what is geonature)

(compatible with GN >= 2.16.0)

### Setup your GeoNature

create an export (public)

view code :

```sql
create or replace view gn_synthese.export_widget_gtsi as
    select
        vsfwa.cd_ref as cd_ref,
        vsfwa.nom_vern as nom_vernaculaire,
        vsfwa.lb_nom as nom_scientifique,
        vsfwa.date_min as date_min,
        vsfwa.date_max as date_max,
        vsfwa.the_geom_4326  as the_geom_4326
    from gn_synthese.v_synthese_for_web_app vsfwa ;
```

go to admin

create a publix export and fill the folloxing field

(screen shot)
