---
title: Flexbox
---

``` css
.flex-container {
    display: flex;
    flex-flow: column wrap; /* shortcut of flex-wrap and flex-direction */
    flex-direction: row /*default*/ | row-reverse | column | column-reverse; /* direction of main-axis */
    flex-wrap: nowrap /*default*/ | wrap | wrap-reverse;
    justify-content: flex-start/*default*/ | flex-end | center | space-between | space-around; /* align along the main-axis of their container. */
    align-items: flex-start | flex-end | center | baseline | stretch /*default*/; /* align along Cross-Axis */
    align-content: flex-start | flex-end | center | space-between | space-around | stretch /*default*/; /* like justify-content for multi-line flex containers, align along Cross-Axis */
}

.flex-container .flex-item {
    order: <integer>; /*0: default *//* Elements are laid out in the ascending order of the order value */
    flex-grow: <number>; /*0: default */ /*  the flex grow factor of a flex item */
    flex-shrink: <number>; /* 1: default */ /*the flex shrink factor of a flex item*/
    flex-basis: content | <'width'>; /*specifies the flex basis which is the initial main size of a flex item*/
    flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ];
    align-self: flex-start | flex-end | center | baseline | stretch | auto /*default*/; /* align along Cross-Axis overriding the align-items value */
}
```
