// Author: Ergogen + @infused-kim + @ceoloide improvements
//
// Kailh Choc PG1350 (v1) + Kailh Choc PG1353 (v2)
// This includes support for LOFREE low profile POM switches (Ghost, Phantom, Wizard)
//
// Nets
//    from: corresponds to pin 1
//    to: corresponds to pin 2
//
// Params
//    reverse: default is false
//      if true, will flip the footprint such that the pcb can be reversible
//    side: default is B for Back
//      the side on which to place the single-side footprint and designator
//    hotswap: default is true
//      if true, will include holes and pads for Kailh choc hotswap sockets
//    solder: default is false
//      if true, will include holes to solder switches (works with hotswap too)
//    outer_pad_width_front: default 2.6
//    outer_pad_width_back: default 2.6
//      Allow you to make the outer hotswap pads smaller to silence DRC
//      warnings when the sockets are to close to the edge cuts.
//    show_keycaps: default is false
//      if true, will add mx sized keycap box around the footprint (18mm)
//    show_corner_marks: default is false
//      if true, will add corner marks to indicate plate hole size and position
//    include_stabilizer_pad: default is true
//      if true, will add a corner pad for the stabilizer leg present in some
//      Choc switches
//    oval_stabilizer_pad: default is false
//      if false, will add an oval pad for the stabilizer leg, and a round one
//      if true. Note that the datasheet calls for a round one.
//    choc_v1_support: default is false
//      if true, will add lateral stabilizer holes that are required for
//      Choc v1 footprints.
//    keycaps_x: default is 18
//    keycaps_y: default is 18
//      Allows you to adjust the width of the keycap outline. For example,
//      to show a 1.5u outline for easier aligning.
//
// notes:
// - hotswap and solder can be used together. The solder holes will then be
// - added above the hotswap holes.
//
// @infused-kim's improvements:
//  - Added hotswap socket outlines
//  - Moved switch corner marks from user layer to silk screen
//  - Added option to adjust keycap size outlines (to show 1.5u outline)
//  - Added option to add hotswap sockets and direct soldering holes at the
//    same time
//  - Made hotswap pads not overlap holes to fix DRC errors
//  - Fixed DRC errors "Drilled holes co-located"
//
// @ceoloide's improvements:
//  - Adjusted footprint to be Choc PG1353 (v2) compatible
//  - Added option to hide corner marks, as they interfere with hotswap silkscreen
//  - Added ability to specify board side

module.exports = {
    params: {
        designator: 'S',
        side: 'B',
        reverse: false,
        hotswap: true,
        solder: false,
        outer_pad_width_front: 2.6,
        outer_pad_width_back: 2.6,
        show_keycaps: false,
        show_corner_marks: false,
        include_stabilizer_pad: true,
        oval_stabilizer_pad: false,
        choc_v1_support: false,
        keycaps_x: 18,
        keycaps_y: 18,
        from: undefined,
        to: undefined
    },
    body: p => {
        const common_top = `
        (module PG1350 (layer F.Cu) (tedit 5DD50112)
            ${p.at /* parametric position */}
            (attr virtual)

            ${'' /* footprint reference */}
            (fp_text reference "${p.ref}" (at 0 0) (layer ${p.side}.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))

            ${''/* middle shaft hole */}
            (pad "" np_thru_hole circle (at 0 0) (size 5 5) (drill 5) (layers *.Cu))
        `

        const choc_v1_stabilizers = `
            (pad "" np_thru_hole circle (at 5.5 0) (size 1.9 1.9) (drill 1.9) (layers *.Cu))
            (pad "" np_thru_hole circle (at -5.5 0) (size 1.9 1.9) (drill 1.9) (layers *.Cu))
        `

        const corner_marks_front = `
            ${''/* corner marks - front */}
            (fp_line (start -7 -6) (end -7 -7) (layer F.SilkS) (width 0.15))
            (fp_line (start -7 7) (end -6 7) (layer F.SilkS) (width 0.15))
            (fp_line (start -6 -7) (end -7 -7) (layer F.SilkS) (width 0.15))
            (fp_line (start -7 7) (end -7 6) (layer F.SilkS) (width 0.15))
            (fp_line (start 7 6) (end 7 7) (layer F.SilkS) (width 0.15))
            (fp_line (start 7 -7) (end 6 -7) (layer F.SilkS) (width 0.15))
            (fp_line (start 6 7) (end 7 7) (layer F.SilkS) (width 0.15))
            (fp_line (start 7 -7) (end 7 -6) (layer F.SilkS) (width 0.15))
        `

        const corner_marks_back = `
            ${''/* corner marks - back */}
            (fp_line (start -7 -6) (end -7 -7) (layer B.SilkS) (width 0.15))
            (fp_line (start -7 7) (end -6 7) (layer B.SilkS) (width 0.15))
            (fp_line (start -6 -7) (end -7 -7) (layer B.SilkS) (width 0.15))
            (fp_line (start -7 7) (end -7 6) (layer B.SilkS) (width 0.15))
            (fp_line (start 7 6) (end 7 7) (layer B.SilkS) (width 0.15))
            (fp_line (start 7 -7) (end 6 -7) (layer B.SilkS) (width 0.15))
            (fp_line (start 6 7) (end 7 7) (layer B.SilkS) (width 0.15))
            (fp_line (start 7 -7) (end 7 -6) (layer B.SilkS) (width 0.15))
        `

        const keycap_xo = 0.5 * p.keycaps_x
        const keycap_yo = 0.5 * p.keycaps_y
        const keycap_marks = `
            ${'' /* keycap marks - 1u */}
            (fp_line (start ${ -keycap_xo } ${ -keycap_yo }) (end ${ keycap_xo } ${ -keycap_yo }) (layer Dwgs.User) (width 0.15))
            (fp_line (start ${ keycap_xo } ${ -keycap_yo }) (end ${ keycap_xo } ${ keycap_yo }) (layer Dwgs.User) (width 0.15))
            (fp_line (start ${ keycap_xo } ${ keycap_yo }) (end ${ -keycap_xo } ${ keycap_yo }) (layer Dwgs.User) (width 0.15))
            (fp_line (start ${ -keycap_xo } ${ keycap_yo }) (end ${ -keycap_xo } ${ -keycap_yo }) (layer Dwgs.User) (width 0.15))
        `

        const hotswap_common = `
            ${'' /* Middle Hole */}
            (pad "" np_thru_hole circle (at 0 -5.95) (size 3 3) (drill 3) (layers *.Cu *.Mask))
        `

        const hotswap_front_pad_cutoff = `
            (pad 1 connect custom (at 3.275 -5.95 ${p.rot}) (size 0.5 0.5) (layers F.Cu F.Mask)
                (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                (gr_poly (pts
                    (xy -1.3 -1.3) (xy -1.3 1.3) (xy 0.05 1.3) (xy 1.3 0.25) (xy 1.3 -1.3)
                ) (width 0))
            ) ${p.from.str})
        `

        const hotswap_front_pad_full = `
            (pad 1 smd rect (at 3.275 -5.95 ${p.rot}) (size 2.6 2.6) (layers F.Cu F.Paste F.Mask)  ${p.from.str})
        `

        const hotswap_back_pad_cutoff = `
            (pad 1 smd custom (at -3.275 -5.95 ${p.rot}) (size 1 1) (layers B.Cu B.Paste B.Mask)
                (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                    (gr_poly (pts
                    (xy -1.3 -1.3) (xy -1.3 0.25) (xy -0.05 1.3) (xy 1.3 1.3) (xy 1.3 -1.3)
                ) (width 0))
            ) ${p.from.str})
        `

        const hotswap_back_pad_full = `
            (pad 1 smd rect (at -3.275 -5.95 ${p.rot}) (size 2.6 2.6) (layers B.Cu B.Paste B.Mask)  ${p.from.str})
        `

        const hotswap_back = `
            ${'' /* Silkscreen outline */}
            (fp_line (start 1.5 -8.2) (end 2 -7.7) (layer B.SilkS) (width 0.15))
            (fp_line (start 7 -1.5) (end 7 -2) (layer B.SilkS) (width 0.15))
            (fp_line (start -1.5 -8.2) (end 1.5 -8.2) (layer B.SilkS) (width 0.15))
            (fp_line (start 7 -6.2) (end 2.5 -6.2) (layer B.SilkS) (width 0.15))
            (fp_line (start 2.5 -2.2) (end 2.5 -1.5) (layer B.SilkS) (width 0.15))
            (fp_line (start -2 -7.7) (end -1.5 -8.2) (layer B.SilkS) (width 0.15))
            (fp_line (start -1.5 -3.7) (end 1 -3.7) (layer B.SilkS) (width 0.15))
            (fp_line (start 7 -5.6) (end 7 -6.2) (layer B.SilkS) (width 0.15))
            (fp_line (start 2 -6.7) (end 2 -7.7) (layer B.SilkS) (width 0.15))
            (fp_line (start 2.5 -1.5) (end 7 -1.5) (layer B.SilkS) (width 0.15))
            (fp_line (start -2 -4.2) (end -1.5 -3.7) (layer B.SilkS) (width 0.15))
            (fp_arc (start 2.499999 -6.7) (end 2 -6.690001) (angle -88.9) (layer B.SilkS) (width 0.15))
            (fp_arc (start 0.97 -2.17) (end 2.5 -2.17) (angle -90) (layer B.SilkS) (width 0.15))

            ${'' /* Left Pad*/}
            ${p.reverse ? hotswap_back_pad_cutoff : hotswap_back_pad_full}

            ${'' /* Right Pad (not cut off) */}
            (pad 2 smd rect (at ${8.275 - (2.6 - p.outer_pad_width_back)/2} -3.75 ${p.rot}) (size ${p.outer_pad_width_back} 2.6) (layers B.Cu B.Paste B.Mask) ${p.to.str})

            ${'' /* Side Hole */}
            (pad "" np_thru_hole circle (at 5 -3.75 195) (size 3 3) (drill 3) (layers *.Cu *.Mask))            
        `

        const hotswap_front = `
            ${'' /* Silkscreen outline */}
            (fp_line (start 2 -4.2) (end 1.5 -3.7) (layer F.SilkS) (width 0.15))
            (fp_line (start 2 -7.7) (end 1.5 -8.2) (layer F.SilkS) (width 0.15))
            (fp_line (start -7 -5.6) (end -7 -6.2) (layer F.SilkS) (width 0.15))
            (fp_line (start 1.5 -3.7) (end -1 -3.7) (layer F.SilkS) (width 0.15))
            (fp_line (start -2.5 -2.2) (end -2.5 -1.5) (layer F.SilkS) (width 0.15))
            (fp_line (start -1.5 -8.2) (end -2 -7.7) (layer F.SilkS) (width 0.15))
            (fp_line (start 1.5 -8.2) (end -1.5 -8.2) (layer F.SilkS) (width 0.15))
            (fp_line (start -2.5 -1.5) (end -7 -1.5) (layer F.SilkS) (width 0.15))
            (fp_line (start -2 -6.7) (end -2 -7.7) (layer F.SilkS) (width 0.15))
            (fp_line (start -7 -1.5) (end -7 -2) (layer F.SilkS) (width 0.15))
            (fp_line (start -7 -6.2) (end -2.5 -6.2) (layer F.SilkS) (width 0.15))
            (fp_arc (start -0.91 -2.11) (end -0.8 -3.7) (angle -90) (layer F.SilkS) (width 0.15))
            (fp_arc (start -2.55 -6.75) (end -2.52 -6.2) (angle -90) (layer F.SilkS) (width 0.15))

            ${'' /* Right Pad (cut off) */}
            ${p.reverse ? hotswap_front_pad_cutoff : hotswap_front_pad_full}

            ${'' /* Left Pad (not cut off) */}
            (pad 2 smd rect (at ${-8.275 + (2.6 - p.outer_pad_width_front)/2} -3.75 ${p.rot}) (size ${p.outer_pad_width_front} 2.6) (layers F.Cu F.Paste F.Mask) ${p.to.str})

            ${'' /* Side Hole */}
            (pad "" np_thru_hole circle (at -5 -3.75 195) (size 3 3) (drill 3) (layers *.Cu *.Mask))
        `

       

        // If both hotswap and solder are enabled, move the solder holes
        // "down" to the opposite side of the switch.
        // Since switches can be rotated by 90 degrees, this won't be a
        // problem as long as we switch the side the holes are on.
        let solder_offset_x_front = '-'
        let solder_offset_x_back = ''
        let solder_offset_y = '-'
        let stab_offset_x_front = ''
        let stab_offset_x_back = '-'
        let stab_offset_y = ''
        if(p.hotswap && p.solder) {
            solder_offset_x_front = ''
            solder_offset_x_back = '-'
            solder_offset_y = ''
            stab_offset_x_front = '-'
            stab_offset_x_back = ''
            stab_offset_y = ''
        }
        const solder_common = `
            (pad 2 thru_hole circle (at 0 ${solder_offset_y}5.9 195) (size 2.032 2.032) (drill 1.27) (layers *.Cu *.Mask) ${p.from.str})
        `

        const solder_front = `
            (pad 1 thru_hole circle (at ${solder_offset_x_front}5 ${solder_offset_y}3.8 195) (size 2.032 2.032) (drill 1.27) (layers *.Cu *.Mask) ${p.to.str})
        `
        const solder_back = `
            (pad 1 thru_hole circle (at ${solder_offset_x_back}5 ${solder_offset_y}3.8 195) (size 2.032 2.032) (drill 1.27) (layers *.Cu *.Mask) ${p.to.str})  
        `
        const oval_corner_stab_front = `
            (pad "" thru_hole oval (at ${stab_offset_x_front}5.55 ${stab_offset_y}5 ${p.rot}) (size 2.2 1.5) (drill oval 1 0.3) (layers *.Cu *.SilkS *.Mask))
        `
        const oval_corner_stab_back = `
            (pad "" thru_hole oval (at ${stab_offset_x_back}5.55 ${stab_offset_y}5 ${p.rot}) (size 2.2 1.5) (drill oval 1 0.3) (layers *.Cu *.SilkS *.Mask))
        `
        const round_corner_stab_front = `
            (pad "" np_thru_hole circle (at ${stab_offset_x_front}5.15 ${stab_offset_y}5 ${p.rot}) (size 1.6 1.6) (drill 1.6) (layers *.Cu *.SilkS *.Mask))
        `
        const round_corner_stab_back = `
            (pad "" np_thru_hole circle (at ${stab_offset_x_back}5.15 ${stab_offset_y}5 ${p.rot}) (size 1.6 1.6) (drill 1.6) (layers *.Cu *.SilkS *.Mask))
        `
        
        const common_bottom = `
        )
        `

        let final = common_top
        if(p.choc_v1_support){
            final += choc_v1_stabilizers
        }
        if(p.show_corner_marks){
            if(p.reverse || p.side == "F"){
                final += corner_marks_front
            }
            if(p.reverse || p.side == "B"){
                final += corner_marks_back
            }
        }
        if(p.show_keycaps){
            final += keycap_marks
        }
        if(p.include_stabilizer_pad){
            if(p.reverse || p.side == "F"){
                if(p.oval_stabilizer_pad){
                    final += oval_corner_stab_front
                } else {
                    final += round_corner_stab_front
                }
            }
            if(p.reverse || p.side == "B"){
                if(p.oval_stabilizer_pad){
                    final += oval_corner_stab_back
                } else {
                    final += round_corner_stab_back
                }
            }
        }
        if(p.hotswap){
            final += hotswap_common
            if(p.reverse || p.side == "F"){
                final += hotswap_front
            }
            if(p.reverse || p.side == "B"){
                final += hotswap_back
            }
        }
        if(p.solder){
            final += solder_common
            if(p.reverse || p.side == "F"){
                final += solder_front
            }
            if(p.reverse || p.side == "B"){
                final += solder_back
            }
        }
        final += common_bottom

        return final
    }
}
