
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.5' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Login.svelte generated by Svelte v3.42.5 */
    const file$l = "src/Login.svelte";

    function create_fragment$m(ctx) {
    	let section;
    	let form;
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let label1;
    	let t2;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			form = element("form");
    			label0 = element("label");
    			t0 = text("user:");
    			input0 = element("input");
    			t1 = space();
    			label1 = element("label");
    			t2 = text("psw:");
    			input1 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-2m2zde");
    			add_location(input0, file$l, 39, 20, 804);
    			add_location(label0, file$l, 39, 8, 792);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "svelte-2m2zde");
    			add_location(input1, file$l, 40, 19, 870);
    			add_location(label1, file$l, 40, 8, 859);
    			add_location(form, file$l, 38, 4, 754);
    			attr_dev(section, "class", "svelte-2m2zde");
    			add_location(section, file$l, 37, 0, 740);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, form);
    			append_dev(form, label0);
    			append_dev(label0, t0);
    			append_dev(label0, input0);
    			set_input_value(input0, /*user*/ ctx[0]);
    			append_dev(form, t1);
    			append_dev(form, label1);
    			append_dev(label1, t2);
    			append_dev(label1, input1);
    			set_input_value(input1, /*psw*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(form, "keyup", /*handleKeyUp*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*user*/ 1 && input0.value !== /*user*/ ctx[0]) {
    				set_input_value(input0, /*user*/ ctx[0]);
    			}

    			if (dirty & /*psw*/ 2 && input1.value !== /*psw*/ ctx[1]) {
    				set_input_value(input1, /*psw*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	const dispatch = createEventDispatcher();
    	let user = "";
    	let psw = "";

    	//Dispatches values entered in user & psw fields on press on Enter.
    	const handleKeyUp = e => {
    		if (e.key === 'Enter') {
    			dispatch('submit', { user, psw });
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		user = this.value;
    		$$invalidate(0, user);
    	}

    	function input1_input_handler() {
    		psw = this.value;
    		$$invalidate(1, psw);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		user,
    		psw,
    		handleKeyUp
    	});

    	$$self.$inject_state = $$props => {
    		if ('user' in $$props) $$invalidate(0, user = $$props.user);
    		if ('psw' in $$props) $$invalidate(1, psw = $$props.psw);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user, psw, handleKeyUp, input0_input_handler, input1_input_handler];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/loadingDots.svelte generated by Svelte v3.42.5 */

    const { Error: Error_1$1 } = globals;
    const file$k = "src/loadingDots.svelte";

    function create_fragment$l(ctx) {
    	let p;
    	let span;
    	let span_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			span = element("span");
    			span.textContent = "--------";
    			add_location(span, file$k, 45, 3, 1065);
    			attr_dev(p, "class", "svelte-1ks9g45");
    			add_location(p, file$k, 45, 0, 1062);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, span);

    			if (!mounted) {
    				dispose = listen_dev(span, "introend", /*introend_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, typewriter$1, {});
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function typewriter$1(node, { speed = 0.2 }) {
    	const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

    	if (!valid) {
    		throw new Error(`This transition only works on elements with a single text node child`);
    	}

    	const text = node.textContent;
    	const duration = text.length / (speed * 0.01);

    	return {
    		duration,
    		tick: t => {
    			const X = '*';
    			const i = ~~(text.length * t);
    			node.textContent = X.repeat(i) + text.substring(i);
    		}
    	};
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LoadingDots', slots, []);
    	const dispatch = createEventDispatcher();

    	const delayTransition = () => {
    		setTimeout(
    			() => {
    				dispatch('finishLoad');
    			},
    			1500
    		);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LoadingDots> was created with unknown prop '${key}'`);
    	});

    	const introend_handler = () => delayTransition();

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		typewriter: typewriter$1,
    		delayTransition
    	});

    	return [delayTransition, introend_handler];
    }

    class LoadingDots extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoadingDots",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/components/StartError.svelte generated by Svelte v3.42.5 */
    const file$j = "src/components/StartError.svelte";

    function create_fragment$k(ctx) {
    	let section;
    	let article;
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let p3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			article = element("article");
    			h2 = element("h2");
    			h2.textContent = "WARNING!";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "The current user agent device is not safe for usage of the APVLHM due to insufficient chroma saturation of the positronic MAAS condensator.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Booting with the current configuration might lead to plasmon-polariton cascading, resulting in a complete annihalation of the Vertex stabilization film. We don't need to tell you what that would entail.";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "To boot the APVLHM, please use a device with a screen size wider than 800 pixels.";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "Press any button to shut down safely.";
    			attr_dev(h2, "class", "svelte-1oa92xl");
    			add_location(h2, file$j, 12, 8, 225);
    			add_location(p0, file$j, 13, 8, 251);
    			add_location(p1, file$j, 14, 8, 406);
    			add_location(p2, file$j, 15, 8, 625);
    			add_location(p3, file$j, 16, 8, 723);
    			attr_dev(article, "class", "svelte-1oa92xl");
    			add_location(article, file$j, 11, 4, 207);
    			attr_dev(section, "class", "svelte-1oa92xl");
    			add_location(section, file$j, 10, 0, 193);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, article);
    			append_dev(article, h2);
    			append_dev(article, t1);
    			append_dev(article, p0);
    			append_dev(article, t3);
    			append_dev(article, p1);
    			append_dev(article, t5);
    			append_dev(article, p2);
    			append_dev(article, t7);
    			append_dev(article, p3);

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StartError', slots, []);
    	const dispatch = createEventDispatcher();

    	const handleKeydown = () => {
    		dispatch('errorShutDown');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StartError> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		handleKeydown
    	});

    	return [handleKeydown];
    }

    class StartError extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StartError",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/Loading.svelte generated by Svelte v3.42.5 */

    const { Error: Error_1, console: console_1$2 } = globals;
    const file$i = "src/Loading.svelte";

    // (70:8) {#if status.second}
    function create_if_block_6$1(ctx) {
    	let li;
    	let li_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "firing targis emitter...";
    			attr_dev(li, "class", "svelte-1d754gx");
    			add_location(li, file$i, 70, 12, 1662);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(li, "introend", /*introend_handler_1*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!li_intro) {
    				add_render_callback(() => {
    					li_intro = create_in_transition(li, typewriter, {});
    					li_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(70:8) {#if status.second}",
    		ctx
    	});

    	return block;
    }

    // (73:8) {#if status.third}
    function create_if_block_5$2(ctx) {
    	let li;
    	let li_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "checking non-Barriar vectors...";
    			attr_dev(li, "class", "svelte-1d754gx");
    			add_location(li, file$i, 73, 12, 1805);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(li, "introend", /*introend_handler_2*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!li_intro) {
    				add_render_callback(() => {
    					li_intro = create_in_transition(li, typewriter, {});
    					li_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(73:8) {#if status.third}",
    		ctx
    	});

    	return block;
    }

    // (76:8) {#if status.fourth}
    function create_if_block_4$3(ctx) {
    	let li;
    	let li_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "decoupling phase shift rotodrive...";
    			attr_dev(li, "class", "svelte-1d754gx");
    			add_location(li, file$i, 76, 12, 1957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(li, "introend", /*introend_handler_3*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!li_intro) {
    				add_render_callback(() => {
    					li_intro = create_in_transition(li, typewriter, {});
    					li_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(76:8) {#if status.fourth}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {#if status.fifth}
    function create_if_block_2$5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (detectMob()) return create_if_block_3$4;
    		return create_else_block$b;
    	}

    	let current_block_type = select_block_type();
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(80:4) {#if status.fifth}",
    		ctx
    	});

    	return block;
    }

    // (83:8) {:else}
    function create_else_block$b(ctx) {
    	let p;
    	let p_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "ALL SYSTEMS NOMINAL. ENGAGING ROTOLIMBIC CHAMBER.";
    			attr_dev(p, "class", "svelte-1d754gx");
    			add_location(p, file$i, 83, 12, 2276);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (!mounted) {
    				dispose = listen_dev(p, "introend", /*introend_handler_4*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, typewriter, {});
    					p_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$b.name,
    		type: "else",
    		source: "(83:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (81:8) {#if detectMob()}
    function create_if_block_3$4(ctx) {
    	let p;
    	let p_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "EXCEPTION TYPE 4 DETECTED. ABORTING START UP";
    			attr_dev(p, "class", "warning svelte-1d754gx");
    			add_location(p, file$i, 81, 12, 2143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (!mounted) {
    				dispose = listen_dev(p, "introend", /*runTimer*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, typewriter, {});
    					p_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(81:8) {#if detectMob()}",
    		ctx
    	});

    	return block;
    }

    // (87:4) {#if status.sixth}
    function create_if_block_1$5(ctx) {
    	let loadingdots;
    	let current;
    	loadingdots = new LoadingDots({ $$inline: true });
    	loadingdots.$on("finishLoad", /*finishLoad_handler*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(loadingdots.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loadingdots, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loadingdots.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loadingdots.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loadingdots, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(87:4) {#if status.sixth}",
    		ctx
    	});

    	return block;
    }

    // (90:4) {#if status.seventh}
    function create_if_block$c(ctx) {
    	let starterror;
    	let current;
    	starterror = new StartError({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(starterror.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(starterror, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(starterror.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(starterror.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(starterror, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(90:4) {#if status.seventh}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let section;
    	let ul;
    	let li;
    	let li_intro;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*status*/ ctx[0].second && create_if_block_6$1(ctx);
    	let if_block1 = /*status*/ ctx[0].third && create_if_block_5$2(ctx);
    	let if_block2 = /*status*/ ctx[0].fourth && create_if_block_4$3(ctx);
    	let if_block3 = /*status*/ ctx[0].fifth && create_if_block_2$5(ctx);
    	let if_block4 = /*status*/ ctx[0].sixth && create_if_block_1$5(ctx);
    	let if_block5 = /*status*/ ctx[0].seventh && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			ul = element("ul");
    			li = element("li");
    			li.textContent = "simulating sub-critical cold start...";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			if (if_block5) if_block5.c();
    			attr_dev(li, "class", "svelte-1d754gx");
    			add_location(li, file$i, 68, 8, 1518);
    			add_location(ul, file$i, 67, 4, 1505);
    			add_location(section, file$i, 66, 0, 1491);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, ul);
    			append_dev(ul, li);
    			append_dev(ul, t1);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t2);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(ul, t3);
    			if (if_block2) if_block2.m(ul, null);
    			append_dev(section, t4);
    			if (if_block3) if_block3.m(section, null);
    			append_dev(section, t5);
    			if (if_block4) if_block4.m(section, null);
    			append_dev(section, t6);
    			if (if_block5) if_block5.m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "introend", /*introend_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*status*/ ctx[0].second) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*status*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(ul, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*status*/ ctx[0].third) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*status*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_5$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(ul, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*status*/ ctx[0].fourth) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*status*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_4$3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(ul, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*status*/ ctx[0].fifth) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*status*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_2$5(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(section, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*status*/ ctx[0].sixth) {
    				if (if_block4) {
    					if (dirty & /*status*/ 1) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_1$5(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(section, t6);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*status*/ ctx[0].seventh) {
    				if (if_block5) {
    					if (dirty & /*status*/ 1) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block$c(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(section, null);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!li_intro) {
    				add_render_callback(() => {
    					li_intro = create_in_transition(li, typewriter, {});
    					li_intro.start();
    				});
    			}

    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block4);
    			transition_out(if_block5);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function typewriter(node, { speed = 5 }) {
    	const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

    	if (!valid) {
    		throw new Error(`This transition only works on elements with a single text node child`);
    	}

    	const delay = 1000;
    	const text = node.textContent;
    	const duration = text.length / (speed * 0.01);

    	return {
    		delay,
    		duration,
    		tick: t => {
    			const i = ~~(text.length * t);
    			node.textContent = text.slice(0, i);
    		}
    	};
    }

    function detectMob() {
    	return window.innerWidth <= 800;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loading', slots, []);
    	const dispatch = createEventDispatcher();

    	let status = {
    		first: false,
    		second: false,
    		third: false,
    		fourth: false,
    		fifth: false
    	};

    	function runTimer() {
    		console.log("hej!");

    		setTimeout(
    			() => {
    				// status.seventh = true;
    				dispatch('mobileDetected');
    			},
    			1000
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Loading> was created with unknown prop '${key}'`);
    	});

    	const introend_handler = () => $$invalidate(0, status.second = true, status);
    	const introend_handler_1 = () => $$invalidate(0, status.third = true, status);
    	const introend_handler_2 = () => $$invalidate(0, status.fourth = true, status);
    	const introend_handler_3 = () => $$invalidate(0, status.fifth = true, status);
    	const introend_handler_4 = () => $$invalidate(0, status.sixth = true, status);

    	function finishLoad_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$capture_state = () => ({
    		LoadingDots,
    		StartError,
    		createEventDispatcher,
    		dispatch,
    		status,
    		typewriter,
    		detectMob,
    		runTimer
    	});

    	$$self.$inject_state = $$props => {
    		if ('status' in $$props) $$invalidate(0, status = $$props.status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		status,
    		runTimer,
    		introend_handler,
    		introend_handler_1,
    		introend_handler_2,
    		introend_handler_3,
    		introend_handler_4,
    		finishLoad_handler
    	];
    }

    class Loading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/LoginStatus.svelte generated by Svelte v3.42.5 */

    const file$h = "src/LoginStatus.svelte";

    // (42:4) {:else}
    function create_else_block$a(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "WELCOME ADMIN";
    			attr_dev(p, "class", "allowed svelte-y53quu");
    			add_location(p, file$h, 43, 12, 890);
    			attr_dev(div, "class", "allowed svelte-y53quu");
    			add_location(div, file$h, 42, 8, 856);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$a.name,
    		type: "else",
    		source: "(42:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#if access === "denied"}
    function create_if_block$b(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "ACCESS DENIED";
    			attr_dev(p, "class", "denied svelte-y53quu");
    			add_location(p, file$h, 39, 12, 785);
    			attr_dev(div, "class", "denied svelte-y53quu");
    			add_location(div, file$h, 38, 8, 752);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(38:4) {#if access === \\\"denied\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let article;

    	function select_block_type(ctx, dirty) {
    		if (/*access*/ ctx[0] === "denied") return create_if_block$b;
    		return create_else_block$a;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			if_block.c();
    			attr_dev(article, "class", "svelte-y53quu");
    			add_location(article, file$h, 36, 0, 704);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			if_block.m(article, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(article, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LoginStatus', slots, []);
    	let { access } = $$props;
    	const writable_props = ['access'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LoginStatus> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('access' in $$props) $$invalidate(0, access = $$props.access);
    	};

    	$$self.$capture_state = () => ({ access });

    	$$self.$inject_state = $$props => {
    		if ('access' in $$props) $$invalidate(0, access = $$props.access);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [access];
    }

    class LoginStatus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { access: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoginStatus",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*access*/ ctx[0] === undefined && !('access' in props)) {
    			console.warn("<LoginStatus> was created without expected prop 'access'");
    		}
    	}

    	get access() {
    		throw new Error("<LoginStatus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set access(value) {
    		throw new Error("<LoginStatus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/WelcomeLogo.svelte generated by Svelte v3.42.5 */
    const file$g = "src/WelcomeLogo.svelte";

    function create_fragment$h(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Δ";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "ASHATT ASSABI";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "INDUSTRIES INC.";
    			attr_dev(p0, "class", "diamond svelte-efj1lw");
    			add_location(p0, file$g, 54, 8, 893);
    			attr_dev(p1, "class", "svelte-efj1lw");
    			add_location(p1, file$g, 55, 8, 926);
    			attr_dev(p2, "class", "svelte-efj1lw");
    			add_location(p2, file$g, 56, 8, 955);
    			attr_dev(div0, "class", "textBox svelte-efj1lw");
    			add_location(div0, file$g, 53, 4, 863);
    			attr_dev(div1, "class", "window svelte-efj1lw");
    			add_location(div1, file$g, 52, 0, 838);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(div0, t3);
    			append_dev(div0, p2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WelcomeLogo', slots, []);
    	const dispatch = createEventDispatcher();

    	onMount(() => {
    		setTimeout(
    			() => {
    				dispatch('logoLoaded');
    			},
    			6000
    		);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WelcomeLogo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, createEventDispatcher, dispatch });
    	return [];
    }

    class WelcomeLogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WelcomeLogo",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/Header.svelte generated by Svelte v3.42.5 */

    const file$f = "src/Header.svelte";

    function create_fragment$g(ctx) {
    	let header;
    	let ul;
    	let li0;
    	let t1;
    	let li1;
    	let t3;
    	let li2;
    	let t5;
    	let li3;
    	let t7;

    	const block = {
    		c: function create() {
    			header = element("header");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Crypto-encabulator running at ∑4/1600V";
    			t1 = space();
    			li1 = element("li");
    			li1.textContent = "Linear phase scattering stable";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "Multi spectrum quantifier modulation .01-α through 600-λ";
    			t5 = space();
    			li3 = element("li");
    			li3.textContent = "Spectrostatic hypo-flux at 13/900γ";
    			t7 = text("\n    ----------------------------------");
    			attr_dev(li0, "class", "svelte-ezn3zu");
    			add_location(li0, file$f, 10, 8, 107);
    			attr_dev(li1, "class", "svelte-ezn3zu");
    			add_location(li1, file$f, 11, 8, 163);
    			attr_dev(li2, "class", "svelte-ezn3zu");
    			add_location(li2, file$f, 12, 8, 211);
    			attr_dev(li3, "class", "svelte-ezn3zu");
    			add_location(li3, file$f, 13, 8, 285);
    			add_location(ul, file$f, 9, 4, 94);
    			add_location(header, file$f, 8, 0, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(header, t7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/Terminal.svelte generated by Svelte v3.42.5 */
    const file$e = "src/Terminal.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let input_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input_1 = element("input");
    			attr_dev(input_1, "type", "text");
    			attr_dev(input_1, "class", "svelte-1cdtxka");
    			add_location(input_1, file$e, 64, 4, 1359);
    			attr_dev(div, "class", "inputWrapper svelte-1cdtxka");
    			add_location(div, file$e, 63, 0, 1328);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input_1);
    			set_input_value(input_1, /*input*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[2]),
    					listen_dev(input_1, "keyup", stop_propagation(/*handleSubmit*/ ctx[1]), false, false, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*input*/ 1 && input_1.value !== /*input*/ ctx[0]) {
    				set_input_value(input_1, /*input*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Terminal', slots, []);
    	const dispatch = createEventDispatcher();
    	let input = "";

    	// const codeArray = [
    	//     {
    	//         command: "run -p",
    	//         main: 
    	//     }
    	// ]
    	const handleSubmit = e => {
    		if (e.key === "Enter") {
    			// console.log(e);
    			//Splits the input to check if command is correct and if following specification is correct.
    			const inputArray = e.target.value.split(" ");

    			const firstArray = inputArray.slice(0, 2).join(" ");
    			const secondArray = inputArray.slice(2).join(" ");

    			dispatch("command", {
    				command: firstArray,
    				argument: secondArray
    			});

    			e.target.value = "";
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Terminal> was created with unknown prop '${key}'`);
    	});

    	function input_1_input_handler() {
    		input = this.value;
    		$$invalidate(0, input);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		input,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('input' in $$props) $$invalidate(0, input = $$props.input);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [input, handleSubmit, input_1_input_handler];
    }

    class Terminal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Terminal",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/KeyPress.svelte generated by Svelte v3.42.5 */

    function create_fragment$e(ctx) {
    	let mounted;
    	let dispose;

    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (!mounted) {
    				dispose = listen_dev(window, "keyup", /*keypress*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('KeyPress', slots, []);
    	const dispatch = createEventDispatcher();

    	const keypress = e => {
    		if (e.key === 'Enter') {
    			dispatch('enterPress');
    		}

    		if (e.key === 'Escape') {
    			dispatch('escPress');
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<KeyPress> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		keypress
    	});

    	return [keypress];
    }

    class KeyPress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyPress",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/Placeholder.svelte generated by Svelte v3.42.5 */

    const file$d = "src/components/Placeholder.svelte";

    // (13:0) {:else}
    function create_else_block$9(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "PRESS ESC TO CLOSE FILE.";
    			attr_dev(h3, "class", "svelte-wpsf7r");
    			add_location(h3, file$d, 13, 0, 189);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$9.name,
    		type: "else",
    		source: "(13:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if terminal === true}
    function create_if_block$a(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "PRESS ESC FOR CONSOLE. ENTER FOR TERMINAL.";
    			attr_dev(h3, "class", "svelte-wpsf7r");
    			add_location(h3, file$d, 11, 0, 129);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(11:0) {#if terminal === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*terminal*/ ctx[0] === true) return create_if_block$a;
    		return create_else_block$9;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Placeholder', slots, []);
    	let { terminal } = $$props;
    	const writable_props = ['terminal'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Placeholder> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('terminal' in $$props) $$invalidate(0, terminal = $$props.terminal);
    	};

    	$$self.$capture_state = () => ({ terminal });

    	$$self.$inject_state = $$props => {
    		if ('terminal' in $$props) $$invalidate(0, terminal = $$props.terminal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [terminal];
    }

    class Placeholder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { terminal: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Placeholder",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*terminal*/ ctx[0] === undefined && !('terminal' in props)) {
    			console.warn("<Placeholder> was created without expected prop 'terminal'");
    		}
    	}

    	get terminal() {
    		throw new Error("<Placeholder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set terminal(value) {
    		throw new Error("<Placeholder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/WelcomeScreen.svelte generated by Svelte v3.42.5 */
    const file$c = "src/WelcomeScreen.svelte";

    // (116:0) {:else}
    function create_else_block$8(ctx) {
    	let terminal;
    	let current;
    	terminal = new Terminal({ $$inline: true });
    	terminal.$on("command", /*command_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(terminal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(terminal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(terminal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(terminal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(terminal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(116:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (114:0) {#if !displayInput}
    function create_if_block$9(ctx) {
    	let placeholder;
    	let current;

    	placeholder = new Placeholder({
    			props: { terminal: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(placeholder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(114:0) {#if !displayInput}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let keypress;
    	let t0;
    	let article;
    	let div0;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let span0;
    	let t6;
    	let t7;
    	let br;
    	let t8;
    	let p3;
    	let t10;
    	let div4;
    	let div1;
    	let ul;
    	let li0;
    	let t12;
    	let li1;
    	let t14;
    	let li2;
    	let t16;
    	let li3;
    	let t17;
    	let span1;
    	let t19;
    	let li4;
    	let t20;
    	let span2;
    	let t22;
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t23;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	keypress = new KeyPress({ $$inline: true });
    	keypress.$on("escPress", /*escPress_handler*/ ctx[1]);
    	keypress.$on("enterPress", /*enterPress_handler*/ ctx[2]);
    	const if_block_creators = [create_if_block$9, create_else_block$8];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*displayInput*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(keypress.$$.fragment);
    			t0 = space();
    			article = element("article");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Ashat Assabi Industries Inc.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "Autonomous Pseudo-Voltonic Lewitt-Hoffenfeld Manifold, AKA the";
    			t4 = space();
    			p2 = element("p");
    			span0 = element("span");
    			span0.textContent = ".";
    			t6 = text("\n    ___  _______________________    ____   ____  ___  ___  ___________________  ___   _  _____ \n   / _ \\/ __/_  __/_  __/ __/ _ \\  / __/_ / / / / / |/ / |/ / __/ __/_  __/ _ \\/ _ | / |/ / _ \\\n  / ___/ _/  / /   / / / _// , _/ _\\ \\/ // / /_/ /    /    / _/_\\ \\  / / / , _/ __ |/    / // /\n/_/  /___/ /_/   /_/ /___/_/|_| /___/\\___/\\____/_/|_/_/|_/___/___/ /_/ /_/|_/_/ |_/_/|_/____/");
    			t7 = space();
    			br = element("br");
    			t8 = space();
    			p3 = element("p");
    			p3.textContent = "Model 86-q4";
    			t10 = space();
    			div4 = element("div");
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "This model of the APVLHM, the \"Petter Sjunnestrand\" is a specialized protocol automaton, proficient in a number of human and computer languages, as specified by the installed modules.";
    			t12 = space();
    			li1 = element("li");
    			li1.textContent = "The main uses for the Petter Sjunnestrand are computer programming and cross-language human communication – although some cases of unverified human-feline communication has been reported.";
    			t14 = space();
    			li2 = element("li");
    			li2.textContent = "The user interface features a non-threatening, kind-looking human face. For its uses in human to human communication, the tripolaric gaustic grid has been fitted with two arrays of muonic base plates,\n                    thus enhancing the attentiveness to human emotion.";
    			t16 = space();
    			li3 = element("li");
    			t17 = text("For more specs, input ");
    			span1 = element("span");
    			span1.textContent = "> run -p specs";
    			t19 = space();
    			li4 = element("li");
    			t20 = text("For a list of all commands, input ");
    			span2 = element("span");
    			span2.textContent = "> help";
    			t22 = space();
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t23 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(p0, "id", "firstParagraph");
    			attr_dev(p0, "class", "svelte-55fq27");
    			add_location(p0, file$c, 77, 8, 1103);
    			attr_dev(p1, "class", "svelte-55fq27");
    			add_location(p1, file$c, 78, 8, 1167);
    			attr_dev(span0, "class", "stupid-dot svelte-55fq27");
    			add_location(span0, file$c, 79, 49, 1286);
    			set_style(p2, "white-space", "pre");
    			attr_dev(p2, "class", "name svelte-55fq27");
    			add_location(p2, file$c, 79, 8, 1245);
    			add_location(br, file$c, 85, 8, 1840);
    			attr_dev(p3, "class", "svelte-55fq27");
    			add_location(p3, file$c, 86, 8, 1854);
    			attr_dev(div0, "class", "header svelte-55fq27");
    			add_location(div0, file$c, 76, 4, 1074);
    			attr_dev(li0, "class", "svelte-55fq27");
    			add_location(li0, file$c, 91, 16, 1974);
    			attr_dev(li1, "class", "svelte-55fq27");
    			add_location(li1, file$c, 94, 16, 2221);
    			attr_dev(li2, "class", "svelte-55fq27");
    			add_location(li2, file$c, 97, 16, 2472);
    			attr_dev(span1, "class", "code");
    			add_location(span1, file$c, 101, 42, 2834);
    			attr_dev(li3, "class", "svelte-55fq27");
    			add_location(li3, file$c, 101, 16, 2808);
    			attr_dev(span2, "class", "code");
    			add_location(span2, file$c, 102, 54, 2934);
    			attr_dev(li4, "class", "svelte-55fq27");
    			add_location(li4, file$c, 102, 16, 2896);
    			add_location(ul, file$c, 90, 12, 1953);
    			attr_dev(div1, "class", "info svelte-55fq27");
    			add_location(div1, file$c, 89, 8, 1922);
    			if (!src_url_equal(img.src, img_src_value = "./img/profile-pic-small.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "ASCII style of Petter Sjunnestrand");
    			attr_dev(img, "class", "svelte-55fq27");
    			add_location(img, file$c, 108, 16, 3133);
    			attr_dev(div2, "class", "imgBg svelte-55fq27");
    			add_location(div2, file$c, 107, 12, 3097);
    			attr_dev(div3, "class", "imgWrapper svelte-55fq27");
    			add_location(div3, file$c, 106, 8, 3060);
    			attr_dev(div4, "class", "infoWrapper svelte-55fq27");
    			add_location(div4, file$c, 88, 4, 1888);
    			attr_dev(article, "class", "svelte-55fq27");
    			add_location(article, file$c, 75, 0, 1060);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(keypress, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(div0, t4);
    			append_dev(div0, p2);
    			append_dev(p2, span0);
    			append_dev(p2, t6);
    			append_dev(div0, t7);
    			append_dev(div0, br);
    			append_dev(div0, t8);
    			append_dev(div0, p3);
    			append_dev(article, t10);
    			append_dev(article, div4);
    			append_dev(div4, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t12);
    			append_dev(ul, li1);
    			append_dev(ul, t14);
    			append_dev(ul, li2);
    			append_dev(ul, t16);
    			append_dev(ul, li3);
    			append_dev(li3, t17);
    			append_dev(li3, span1);
    			append_dev(ul, t19);
    			append_dev(ul, li4);
    			append_dev(li4, t20);
    			append_dev(li4, span2);
    			append_dev(div4, t22);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			insert_dev(target, t23, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keypress.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keypress.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keypress, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article);
    			if (detaching) detach_dev(t23);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WelcomeScreen', slots, []);
    	let displayInput = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WelcomeScreen> was created with unknown prop '${key}'`);
    	});

    	function escPress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const enterPress_handler = () => $$invalidate(0, displayInput = true);

    	function command_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$capture_state = () => ({
    		Terminal,
    		KeyPress,
    		Placeholder,
    		displayInput
    	});

    	$$self.$inject_state = $$props => {
    		if ('displayInput' in $$props) $$invalidate(0, displayInput = $$props.displayInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [displayInput, escPress_handler, enterPress_handler, command_handler];
    }

    class WelcomeScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WelcomeScreen",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/ModuleFile.svelte generated by Svelte v3.42.5 */

    const { console: console_1$1 } = globals;
    const file$b = "src/components/ModuleFile.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (78:8) {#each currentSkills as skill}
    function create_each_block_1$1(ctx) {
    	let div3;
    	let div0;
    	let t0_value = /*skill*/ ctx[6].name + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*skill*/ ctx[6].memory + "";
    	let t2;
    	let t3;
    	let t4;
    	let div2;
    	let raw_value = /*starCounter*/ ctx[3](/*skill*/ ctx[6].memory) + "";

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = text("kB");
    			t4 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "leftmost svelte-1kudnza");
    			add_location(div0, file$b, 79, 16, 1691);
    			attr_dev(div1, "class", "svelte-1kudnza");
    			add_location(div1, file$b, 82, 16, 1786);
    			attr_dev(div2, "class", "svelte-1kudnza");
    			add_location(div2, file$b, 85, 16, 1868);
    			attr_dev(div3, "class", "skill svelte-1kudnza");
    			add_location(div3, file$b, 78, 12, 1655);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			div2.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(78:8) {#each currentSkills as skill}",
    		ctx
    	});

    	return block;
    }

    // (91:8) {#if currentFile.subSkills}
    function create_if_block$8(ctx) {
    	let p;
    	let t1;
    	let ul;
    	let each_value = /*currentFile*/ ctx[1].subSkills;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Plug-ins";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "leftmost plugins svelte-1kudnza");
    			add_location(p, file$b, 91, 8, 2030);
    			attr_dev(ul, "class", "svelte-1kudnza");
    			add_location(ul, file$b, 92, 8, 2079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentFile*/ 2) {
    				each_value = /*currentFile*/ ctx[1].subSkills;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(91:8) {#if currentFile.subSkills}",
    		ctx
    	});

    	return block;
    }

    // (94:12) {#each currentFile.subSkills as skill}
    function create_each_block$7(ctx) {
    	let li;
    	let t_value = /*skill*/ ctx[6] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-1kudnza");
    			add_location(li, file$b, 94, 16, 2151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(94:12) {#each currentFile.subSkills as skill}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let p;
    	let t3;
    	let div0;
    	let t4;
    	let each_value_1 = /*currentSkills*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block = /*currentFile*/ ctx[1].subSkills && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(/*fileName*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			p.textContent = `${/*currentFile*/ ctx[1].text}`;
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block) if_block.c();
    			add_location(h2, file$b, 74, 4, 1522);
    			add_location(p, file$b, 75, 4, 1546);
    			attr_dev(div0, "class", "skillsWrapper svelte-1kudnza");
    			add_location(div0, file$b, 76, 4, 1576);
    			attr_dev(div1, "class", "fileWindow svelte-1kudnza");
    			add_location(div1, file$b, 73, 0, 1493);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t4);
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fileName*/ 1) set_data_dev(t0, /*fileName*/ ctx[0]);

    			if (dirty & /*starCounter, currentSkills*/ 12) {
    				each_value_1 = /*currentSkills*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*currentFile*/ ctx[1].subSkills) if_block.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModuleFile', slots, []);
    	let { fileObjects } = $$props;
    	let { fileName } = $$props;
    	const dispatch = createEventDispatcher();

    	onDestroy(() => {
    		dispatch('closeFile');
    	});

    	const currentFile = fileObjects.find(file => file.title === fileName);
    	const currentSkills = currentFile.skills;
    	console.log(currentSkills);

    	const starCounter = allocMemory => {
    		const litStars = ('*').repeat(allocMemory / 64);
    		const darkStars = ('*').repeat(5 - allocMemory / 64);

    		//Interestingly, the classes created here cannot be reached in the component CSS, but must be styled in the global CSS file.
    		const starLine = `<span class="litStars">${litStars}</span><span class="darkStars">${darkStars}</span>`;

    		console.log(allocMemory);
    		return starLine;
    	};

    	const writable_props = ['fileObjects', 'fileName'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<ModuleFile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('fileObjects' in $$props) $$invalidate(4, fileObjects = $$props.fileObjects);
    		if ('fileName' in $$props) $$invalidate(0, fileName = $$props.fileName);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		createEventDispatcher,
    		fileObjects,
    		fileName,
    		dispatch,
    		currentFile,
    		currentSkills,
    		starCounter
    	});

    	$$self.$inject_state = $$props => {
    		if ('fileObjects' in $$props) $$invalidate(4, fileObjects = $$props.fileObjects);
    		if ('fileName' in $$props) $$invalidate(0, fileName = $$props.fileName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fileName, currentFile, currentSkills, starCounter, fileObjects];
    }

    class ModuleFile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { fileObjects: 4, fileName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModuleFile",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fileObjects*/ ctx[4] === undefined && !('fileObjects' in props)) {
    			console_1$1.warn("<ModuleFile> was created without expected prop 'fileObjects'");
    		}

    		if (/*fileName*/ ctx[0] === undefined && !('fileName' in props)) {
    			console_1$1.warn("<ModuleFile> was created without expected prop 'fileName'");
    		}
    	}

    	get fileObjects() {
    		throw new Error("<ModuleFile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileObjects(value) {
    		throw new Error("<ModuleFile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileName() {
    		throw new Error("<ModuleFile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileName(value) {
    		throw new Error("<ModuleFile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Modules.svelte generated by Svelte v3.42.5 */
    const file$a = "src/components/Modules.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (125:0) {:else}
    function create_else_block_2$1(ctx) {
    	let keypress;
    	let current;
    	keypress = new KeyPress({ $$inline: true });
    	keypress.$on("escPress", /*escPress_handler_1*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(keypress.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(keypress, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keypress.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keypress.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keypress, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(125:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (123:0) {#if !openFile}
    function create_if_block_3$3(ctx) {
    	let keypress;
    	let current;
    	keypress = new KeyPress({ $$inline: true });
    	keypress.$on("escPress", /*escPress_handler*/ ctx[3]);
    	keypress.$on("enterPress", /*enterPress_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(keypress.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(keypress, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keypress.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keypress.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keypress, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(123:0) {#if !openFile}",
    		ctx
    	});

    	return block;
    }

    // (136:8) {:else}
    function create_else_block_1$3(ctx) {
    	let div;
    	let each_value = /*cardObjects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "modulesWrapper");
    			attr_dev(div, "class", "svelte-vbzbz7");
    			add_location(div, file$a, 136, 8, 3926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cardObjects*/ 1) {
    				each_value = /*cardObjects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$3.name,
    		type: "else",
    		source: "(136:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (134:4) {#if openFile}
    function create_if_block_2$4(ctx) {
    	let modulefile;
    	let current;

    	modulefile = new ModuleFile({
    			props: {
    				fileName: /*openFile*/ ctx[1],
    				fileObjects: /*cardObjects*/ ctx[0]
    			},
    			$$inline: true
    		});

    	modulefile.$on("closeFile", /*closeFile_handler*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(modulefile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modulefile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modulefile_changes = {};
    			if (dirty & /*openFile*/ 2) modulefile_changes.fileName = /*openFile*/ ctx[1];
    			if (dirty & /*cardObjects*/ 1) modulefile_changes.fileObjects = /*cardObjects*/ ctx[0];
    			modulefile.$set(modulefile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modulefile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modulefile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modulefile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(134:4) {#if openFile}",
    		ctx
    	});

    	return block;
    }

    // (138:12) {#each cardObjects as cardObject}
    function create_each_block$6(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t1_value = /*cardObject*/ ctx[8].title + "";
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = text(".sys");
    			t3 = space();
    			if (!src_url_equal(img.src, img_src_value = "./img/folded-file.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "white paper folded in top right corner");
    			attr_dev(img, "class", "file svelte-vbzbz7");
    			add_location(img, file$a, 140, 20, 4105);
    			attr_dev(h2, "class", "svelte-vbzbz7");
    			add_location(h2, file$a, 141, 20, 4217);
    			attr_dev(div, "class", "card svelte-vbzbz7");
    			add_location(div, file$a, 139, 16, 4066);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h2);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cardObjects*/ 1 && t1_value !== (t1_value = /*cardObject*/ ctx[8].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(138:12) {#each cardObjects as cardObject}",
    		ctx
    	});

    	return block;
    }

    // (154:4) {:else}
    function create_else_block$7(ctx) {
    	let terminal;
    	let current;
    	terminal = new Terminal({ $$inline: true });
    	terminal.$on("command", /*command_handler*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(terminal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(terminal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(terminal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(terminal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(terminal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(154:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (152:4) {#if !displayInput}
    function create_if_block_1$4(ctx) {
    	let placeholder;
    	let current;

    	placeholder = new Placeholder({
    			props: { terminal: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(placeholder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(152:4) {#if !displayInput}",
    		ctx
    	});

    	return block;
    }

    // (149:0) {#if openFile}
    function create_if_block$7(ctx) {
    	let placeholder;
    	let current;

    	placeholder = new Placeholder({
    			props: { terminal: false },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(placeholder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(149:0) {#if openFile}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let article;
    	let div;
    	let h1;
    	let t2;
    	let p0;
    	let t3;
    	let span0;
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let span1;
    	let t9;
    	let t10;
    	let current_block_type_index_1;
    	let if_block1;
    	let t11;
    	let current_block_type_index_2;
    	let if_block2;
    	let if_block2_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$3, create_else_block_2$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*openFile*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block_2$4, create_else_block_1$3];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*openFile*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    	const if_block_creators_2 = [create_if_block$7, create_if_block_1$4, create_else_block$7];
    	const if_blocks_2 = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*openFile*/ ctx[1]) return 0;
    		if (!/*displayInput*/ ctx[2]) return 1;
    		return 2;
    	}

    	current_block_type_index_2 = select_block_type_2(ctx);
    	if_block2 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t0 = space();
    			article = element("article");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "MODULES";
    			t2 = space();
    			p0 = element("p");
    			t3 = text("Input ");
    			span0 = element("span");
    			span0.textContent = "> open -f [file]";
    			t5 = text(" to open");
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Input ");
    			span1 = element("span");
    			span1.textContent = "> help";
    			t9 = text(" for list of commands.");
    			t10 = space();
    			if_block1.c();
    			t11 = space();
    			if_block2.c();
    			if_block2_anchor = empty();
    			add_location(h1, file$a, 129, 8, 3625);
    			attr_dev(span0, "class", "code");
    			add_location(span0, file$a, 130, 17, 3659);
    			add_location(p0, file$a, 130, 8, 3650);
    			attr_dev(span1, "class", "code");
    			add_location(span1, file$a, 131, 17, 3732);
    			add_location(p1, file$a, 131, 8, 3723);
    			attr_dev(div, "class", "header");
    			add_location(div, file$a, 128, 4, 3596);
    			attr_dev(article, "class", "svelte-vbzbz7");
    			add_location(article, file$a, 127, 0, 3582);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, p0);
    			append_dev(p0, t3);
    			append_dev(p0, span0);
    			append_dev(p0, t5);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(p1, span1);
    			append_dev(p1, t9);
    			append_dev(article, t10);
    			if_blocks_1[current_block_type_index_1].m(article, null);
    			insert_dev(target, t11, anchor);
    			if_blocks_2[current_block_type_index_2].m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t0.parentNode, t0);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(article, null);
    			}

    			let previous_block_index_2 = current_block_type_index_2;
    			current_block_type_index_2 = select_block_type_2(ctx);

    			if (current_block_type_index_2 !== previous_block_index_2) {
    				group_outros();

    				transition_out(if_blocks_2[previous_block_index_2], 1, 1, () => {
    					if_blocks_2[previous_block_index_2] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks_2[current_block_type_index_2];

    				if (!if_block2) {
    					if_block2 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);
    					if_block2.c();
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article);
    			if_blocks_1[current_block_type_index_1].d();
    			if (detaching) detach_dev(t11);
    			if_blocks_2[current_block_type_index_2].d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modules', slots, []);
    	let displayInput = false;

    	let { cardObjects = [
    		{
    			title: "langtech",
    			text: "Module enables two-way communication in selected languages. The MENA-package includes Arabic, Sorani Kurdish and Hebrew. Note that skill in each individual language is controlled by amount of allocated memory. The currently used AKH-program allocates memory as follows:",
    			skills: [
    				{ name: "Swedish", memory: 320 },
    				{ name: "English", memory: 256 },
    				{ name: "Arabic", memory: 192 },
    				{ name: "Sorani", memory: 128 },
    				{ name: "Hebrew", memory: 64 }
    			]
    		},
    		{
    			title: "webproc",
    			text: "The WebProc-1.21.3 module enables skillful processing of web design tools including HTML, CSS & JavaScript. Version 1.0 was released in september 2022 after two years of development. Since then, numerous patches and minor releases have been made, that address bugs and add new features. Allocated memory program below.",
    			skills: [
    				{ name: "HTML", memory: 256 },
    				{ name: "CSS", memory: 256 },
    				{ name: "JavaScript", memory: 256 },
    				{ name: "PHP", memory: 128 },
    				{ name: "Java", memory: 64 }
    			],
    			subSkills: [
    				"AngularJS",
    				"Angular 2+",
    				"RxJS",
    				"WS",
    				"React",
    				"Svelte",
    				"Vue",
    				"Nodejs",
    				"Socket IO",
    				"Express",
    				"Redux",
    				"SASS",
    				"Tailwind",
    				"Mongodb",
    				"MySQL",
    				"SQL Server",
    				"Laminas/Zend"
    			]
    		}
    	] } = $$props;

    	let { openFile } = $$props;
    	const writable_props = ['cardObjects', 'openFile'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modules> was created with unknown prop '${key}'`);
    	});

    	function escPress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const enterPress_handler = () => $$invalidate(2, displayInput = true);

    	function escPress_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function closeFile_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function command_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('cardObjects' in $$props) $$invalidate(0, cardObjects = $$props.cardObjects);
    		if ('openFile' in $$props) $$invalidate(1, openFile = $$props.openFile);
    	};

    	$$self.$capture_state = () => ({
    		KeyPress,
    		Terminal,
    		Placeholder,
    		ModuleFile,
    		displayInput,
    		cardObjects,
    		openFile
    	});

    	$$self.$inject_state = $$props => {
    		if ('displayInput' in $$props) $$invalidate(2, displayInput = $$props.displayInput);
    		if ('cardObjects' in $$props) $$invalidate(0, cardObjects = $$props.cardObjects);
    		if ('openFile' in $$props) $$invalidate(1, openFile = $$props.openFile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cardObjects,
    		openFile,
    		displayInput,
    		escPress_handler,
    		enterPress_handler,
    		escPress_handler_1,
    		closeFile_handler,
    		command_handler
    	];
    }

    class Modules extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { cardObjects: 0, openFile: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modules",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*openFile*/ ctx[1] === undefined && !('openFile' in props)) {
    			console.warn("<Modules> was created without expected prop 'openFile'");
    		}
    	}

    	get cardObjects() {
    		throw new Error("<Modules>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardObjects(value) {
    		throw new Error("<Modules>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openFile() {
    		throw new Error("<Modules>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openFile(value) {
    		throw new Error("<Modules>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/WorkFile.svelte generated by Svelte v3.42.5 */
    const file$9 = "src/components/WorkFile.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let h3;
    	let t3;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = `${/*currentFile*/ ctx[0].title}`;
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = `${/*currentFile*/ ctx[0].year}`;
    			t3 = space();
    			p = element("p");
    			p.textContent = `${/*currentFile*/ ctx[0].desc}`;
    			add_location(h2, file$9, 28, 4, 571);
    			add_location(h3, file$9, 29, 4, 604);
    			add_location(p, file$9, 30, 4, 636);
    			attr_dev(div, "class", "fileWindow svelte-bgibza");
    			add_location(div, file$9, 27, 0, 542);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, h3);
    			append_dev(div, t3);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WorkFile', slots, []);
    	let { workArray } = $$props;
    	let { fileIndex } = $$props;
    	const dispatch = createEventDispatcher();

    	onDestroy(() => {
    		dispatch('closeFile');
    	});

    	const currentFile = workArray.find(file => file.index === fileIndex);
    	const writable_props = ['workArray', 'fileIndex'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WorkFile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('workArray' in $$props) $$invalidate(1, workArray = $$props.workArray);
    		if ('fileIndex' in $$props) $$invalidate(2, fileIndex = $$props.fileIndex);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		createEventDispatcher,
    		workArray,
    		fileIndex,
    		dispatch,
    		currentFile
    	});

    	$$self.$inject_state = $$props => {
    		if ('workArray' in $$props) $$invalidate(1, workArray = $$props.workArray);
    		if ('fileIndex' in $$props) $$invalidate(2, fileIndex = $$props.fileIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentFile, workArray, fileIndex];
    }

    class WorkFile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { workArray: 1, fileIndex: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WorkFile",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*workArray*/ ctx[1] === undefined && !('workArray' in props)) {
    			console.warn("<WorkFile> was created without expected prop 'workArray'");
    		}

    		if (/*fileIndex*/ ctx[2] === undefined && !('fileIndex' in props)) {
    			console.warn("<WorkFile> was created without expected prop 'fileIndex'");
    		}
    	}

    	get workArray() {
    		throw new Error("<WorkFile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set workArray(value) {
    		throw new Error("<WorkFile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileIndex() {
    		throw new Error("<WorkFile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileIndex(value) {
    		throw new Error("<WorkFile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Work.svelte generated by Svelte v3.42.5 */
    const file$8 = "src/components/Work.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (117:8) {:else}
    function create_else_block_1$2(ctx) {
    	let div;
    	let ul;
    	let li0;
    	let t1;
    	let li1;
    	let t3;
    	let li2;
    	let t5;
    	let li3;
    	let t7;
    	let each_value = /*workArray*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "INDEX";
    			t1 = space();
    			li1 = element("li");
    			li1.textContent = "YEAR";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "EMPLOYER";
    			t5 = space();
    			li3 = element("li");
    			li3.textContent = "TITLE";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(li0, "class", "label work-index work-detail svelte-12xnxkb");
    			add_location(li0, file$8, 119, 20, 3253);
    			attr_dev(li1, "class", "label work-detail svelte-12xnxkb");
    			add_location(li1, file$8, 120, 20, 3325);
    			attr_dev(li2, "class", "label work-detail svelte-12xnxkb");
    			add_location(li2, file$8, 121, 20, 3385);
    			attr_dev(li3, "class", "label work-title work-detail svelte-12xnxkb");
    			add_location(li3, file$8, 122, 20, 3449);
    			attr_dev(ul, "class", "work-card svelte-12xnxkb");
    			add_location(ul, file$8, 118, 16, 3210);
    			attr_dev(div, "class", "work-wrapper svelte-12xnxkb");
    			add_location(div, file$8, 117, 12, 3167);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(div, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*workArray*/ 1) {
    				each_value = /*workArray*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(117:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (115:4) {#if openFile}
    function create_if_block_2$3(ctx) {
    	let workfile;
    	let current;

    	workfile = new WorkFile({
    			props: {
    				fileIndex: /*openFile*/ ctx[1],
    				workArray: /*workArray*/ ctx[0]
    			},
    			$$inline: true
    		});

    	workfile.$on("closeFile", /*closeFile_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(workfile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(workfile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const workfile_changes = {};
    			if (dirty & /*openFile*/ 2) workfile_changes.fileIndex = /*openFile*/ ctx[1];
    			workfile.$set(workfile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(workfile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(workfile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(workfile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(115:4) {#if openFile}",
    		ctx
    	});

    	return block;
    }

    // (125:16) {#each workArray as work, index}
    function create_each_block$5(ctx) {
    	let ul;
    	let li0;
    	let t0;
    	let t1;
    	let li1;
    	let t2_value = /*work*/ ctx[7].year + "";
    	let t2;
    	let t3;
    	let li2;
    	let t4_value = /*work*/ ctx[7].employer + "";
    	let t4;
    	let t5;
    	let li3;
    	let t6_value = /*work*/ ctx[7].title + "";
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			t0 = text(/*index*/ ctx[9]);
    			t1 = space();
    			li1 = element("li");
    			t2 = text(t2_value);
    			t3 = space();
    			li2 = element("li");
    			t4 = text(t4_value);
    			t5 = space();
    			li3 = element("li");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(li0, "class", "work-index work-detail svelte-12xnxkb");
    			add_location(li0, file$8, 126, 24, 3639);
    			attr_dev(li1, "class", "work-year work-detail svelte-12xnxkb");
    			add_location(li1, file$8, 127, 24, 3711);
    			attr_dev(li2, "class", "work-employer work-detail svelte-12xnxkb");
    			add_location(li2, file$8, 128, 24, 3786);
    			attr_dev(li3, "class", "work-title work-detail svelte-12xnxkb");
    			add_location(li3, file$8, 129, 24, 3869);
    			attr_dev(ul, "class", "work-card svelte-12xnxkb");
    			add_location(ul, file$8, 125, 20, 3592);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, t6);
    			append_dev(ul, t7);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(125:16) {#each workArray as work, index}",
    		ctx
    	});

    	return block;
    }

    // (143:4) {:else}
    function create_else_block$6(ctx) {
    	let terminal;
    	let current;
    	terminal = new Terminal({ $$inline: true });
    	terminal.$on("command", /*command_handler*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(terminal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(terminal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(terminal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(terminal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(terminal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(143:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (141:4) {#if !displayInput}
    function create_if_block_1$3(ctx) {
    	let placeholder;
    	let current;

    	placeholder = new Placeholder({
    			props: { terminal: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(placeholder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(141:4) {#if !displayInput}",
    		ctx
    	});

    	return block;
    }

    // (137:0) {#if openFile}
    function create_if_block$6(ctx) {
    	let placeholder;
    	let current;
    	placeholder = new Placeholder({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(placeholder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(137:0) {#if openFile}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let keypress;
    	let t0;
    	let article;
    	let div;
    	let h1;
    	let t2;
    	let p0;
    	let t3;
    	let span0;
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let span1;
    	let t9;
    	let t10;
    	let current_block_type_index;
    	let if_block0;
    	let t11;
    	let current_block_type_index_1;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	keypress = new KeyPress({ $$inline: true });
    	keypress.$on("escPress", /*escPress_handler*/ ctx[3]);
    	keypress.$on("enterPress", /*enterPress_handler*/ ctx[4]);
    	const if_block_creators = [create_if_block_2$3, create_else_block_1$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*openFile*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block$6, create_if_block_1$3, create_else_block$6];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*openFile*/ ctx[1]) return 0;
    		if (!/*displayInput*/ ctx[2]) return 1;
    		return 2;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	const block = {
    		c: function create() {
    			create_component(keypress.$$.fragment);
    			t0 = space();
    			article = element("article");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "WORK";
    			t2 = space();
    			p0 = element("p");
    			t3 = text("Input ");
    			span0 = element("span");
    			span0.textContent = "> open -f [index]";
    			t5 = text(" to open");
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Input ");
    			span1 = element("span");
    			span1.textContent = "> help";
    			t9 = text(" for list of commands.");
    			t10 = space();
    			if_block0.c();
    			t11 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    			add_location(h1, file$8, 110, 8, 2879);
    			attr_dev(span0, "class", "code");
    			add_location(span0, file$8, 111, 17, 2910);
    			add_location(p0, file$8, 111, 8, 2901);
    			attr_dev(span1, "class", "code");
    			add_location(span1, file$8, 112, 17, 2984);
    			add_location(p1, file$8, 112, 8, 2975);
    			attr_dev(div, "class", "header");
    			add_location(div, file$8, 109, 4, 2850);
    			attr_dev(article, "class", "svelte-12xnxkb");
    			add_location(article, file$8, 108, 0, 2836);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(keypress, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, p0);
    			append_dev(p0, t3);
    			append_dev(p0, span0);
    			append_dev(p0, t5);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(p1, span1);
    			append_dev(p1, t9);
    			append_dev(article, t10);
    			if_blocks[current_block_type_index].m(article, null);
    			insert_dev(target, t11, anchor);
    			if_blocks_1[current_block_type_index_1].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(article, null);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 !== previous_block_index_1) {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keypress.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keypress.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keypress, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t11);
    			if_blocks_1[current_block_type_index_1].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Work', slots, []);
    	let displayInput = false;

    	const workArray = [
    		{
    			index: "0",
    			year: "2022 - (present)",
    			employer: "iquest ab",
    			title: "System developer",
    			desc: "Front end lead. Responsible for managing and optimizing the front end code base; push projects from design phase to launch; mentor interns. Development and bugfixing in PHP and Java included."
    		},
    		{
    			index: "1",
    			year: "2022",
    			employer: "Nordic Morning",
    			title: "Font end developer (internship)",
    			desc: "In charge of redesigning internal systems for SEO marketing team. Includes database design and management, Google Ads API implementation, frontend and backend design."
    		},
    		{
    			index: "2",
    			year: "2021",
    			employer: "Uppsala University",
    			title: "Course developer",
    			desc: "Developed online material for two university courses in Arabic."
    		},
    		{
    			index: "3",
    			year: "2020",
    			employer: "Uppsala University",
    			title: "Arabic teacher",
    			desc: "Taught Arabic reading comprehension in a university course in Arabic."
    		},
    		{
    			index: "4",
    			year: "2015-2016",
    			employer: "Lernia AB",
    			title: "Swedish teacher",
    			desc: "Taught Swedish for immigrants."
    		}
    	];

    	let { openFile } = $$props;
    	const writable_props = ['openFile'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Work> was created with unknown prop '${key}'`);
    	});

    	function escPress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const enterPress_handler = () => $$invalidate(2, displayInput = true);

    	function closeFile_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function command_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('openFile' in $$props) $$invalidate(1, openFile = $$props.openFile);
    	};

    	$$self.$capture_state = () => ({
    		KeyPress,
    		Terminal,
    		WorkFile,
    		Placeholder,
    		displayInput,
    		workArray,
    		openFile
    	});

    	$$self.$inject_state = $$props => {
    		if ('displayInput' in $$props) $$invalidate(2, displayInput = $$props.displayInput);
    		if ('openFile' in $$props) $$invalidate(1, openFile = $$props.openFile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		workArray,
    		openFile,
    		displayInput,
    		escPress_handler,
    		enterPress_handler,
    		closeFile_handler,
    		command_handler
    	];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { workArray: 0, openFile: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*openFile*/ ctx[1] === undefined && !('openFile' in props)) {
    			console.warn("<Work> was created without expected prop 'openFile'");
    		}
    	}

    	get workArray() {
    		return this.$$.ctx[0];
    	}

    	set workArray(value) {
    		throw new Error("<Work>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openFile() {
    		throw new Error("<Work>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openFile(value) {
    		throw new Error("<Work>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Education.svelte generated by Svelte v3.42.5 */
    const file$7 = "src/components/Education.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (87:12) {#each eduArray as edu}
    function create_each_block$4(ctx) {
    	let ul;
    	let li0;
    	let t0_value = /*edu*/ ctx[5].graduationYear + "";
    	let t0;
    	let t1;
    	let li1;
    	let t2_value = /*edu*/ ctx[5].school + "";
    	let t2;
    	let t3;
    	let li2;
    	let t4_value = /*edu*/ ctx[5].education + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			li1 = element("li");
    			t2 = text(t2_value);
    			t3 = space();
    			li2 = element("li");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(li0, "class", "edu-year edu-detail svelte-lqc6e6");
    			add_location(li0, file$7, 88, 20, 2082);
    			attr_dev(li1, "class", "edu-school edu-detail svelte-lqc6e6");
    			add_location(li1, file$7, 89, 20, 2160);
    			attr_dev(li2, "class", "edu-edu edu-detail svelte-lqc6e6");
    			add_location(li2, file$7, 90, 20, 2232);
    			attr_dev(ul, "class", "edu-card svelte-lqc6e6");
    			add_location(ul, file$7, 87, 16, 2040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, t4);
    			append_dev(ul, t5);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(87:12) {#each eduArray as edu}",
    		ctx
    	});

    	return block;
    }

    // (100:0) {:else}
    function create_else_block$5(ctx) {
    	let terminal;
    	let current;
    	terminal = new Terminal({ $$inline: true });
    	terminal.$on("command", /*command_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(terminal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(terminal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(terminal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(terminal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(terminal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(100:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (98:0) {#if !displayInput}
    function create_if_block$5(ctx) {
    	let placeholder;
    	let current;

    	placeholder = new Placeholder({
    			props: { terminal: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(placeholder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(98:0) {#if !displayInput}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let keypress;
    	let t0;
    	let article;
    	let div0;
    	let h1;
    	let t2;
    	let p;
    	let t3;
    	let span;
    	let t5;
    	let t6;
    	let div1;
    	let ul;
    	let li0;
    	let t8;
    	let li1;
    	let t10;
    	let li2;
    	let t12;
    	let t13;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	keypress = new KeyPress({ $$inline: true });
    	keypress.$on("escPress", /*escPress_handler*/ ctx[2]);
    	keypress.$on("enterPress", /*enterPress_handler*/ ctx[3]);
    	let each_value = /*eduArray*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const if_block_creators = [create_if_block$5, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*displayInput*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(keypress.$$.fragment);
    			t0 = space();
    			article = element("article");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "WORK";
    			t2 = space();
    			p = element("p");
    			t3 = text("Input ");
    			span = element("span");
    			span.textContent = "> help";
    			t5 = text(" for list of commands.");
    			t6 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "YEAR";
    			t8 = space();
    			li1 = element("li");
    			li1.textContent = "SCHOOL";
    			t10 = space();
    			li2 = element("li");
    			li2.textContent = "EDUCATION";
    			t12 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$7, 77, 8, 1621);
    			attr_dev(span, "class", "code");
    			add_location(span, file$7, 78, 17, 1652);
    			add_location(p, file$7, 78, 8, 1643);
    			attr_dev(div0, "class", "header");
    			add_location(div0, file$7, 76, 4, 1592);
    			attr_dev(li0, "class", "label edu-detail svelte-lqc6e6");
    			add_location(li0, file$7, 82, 16, 1806);
    			attr_dev(li1, "class", "label edu-detail svelte-lqc6e6");
    			add_location(li1, file$7, 83, 16, 1861);
    			attr_dev(li2, "class", "label edu-edu edu-detail svelte-lqc6e6");
    			add_location(li2, file$7, 84, 16, 1918);
    			attr_dev(ul, "class", "edu-card svelte-lqc6e6");
    			add_location(ul, file$7, 81, 12, 1768);
    			attr_dev(div1, "class", "edu-wrapper svelte-lqc6e6");
    			add_location(div1, file$7, 80, 8, 1730);
    			attr_dev(article, "class", "svelte-lqc6e6");
    			add_location(article, file$7, 75, 0, 1578);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(keypress, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(p, span);
    			append_dev(p, t5);
    			append_dev(article, t6);
    			append_dev(article, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t8);
    			append_dev(ul, li1);
    			append_dev(ul, t10);
    			append_dev(ul, li2);
    			append_dev(div1, t12);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t13, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*eduArray*/ 1) {
    				each_value = /*eduArray*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keypress.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keypress.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keypress, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t13);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Education', slots, []);
    	let displayInput = false;

    	const eduArray = [
    		{
    			graduationYear: "2022 (present)",
    			school: "Medieinstitutet",
    			education: "Font end development"
    		},
    		{
    			graduationYear: "2019",
    			school: "Uppsala University",
    			education: "Master's degree in Semitic Languages"
    		},
    		{
    			graduationYear: "2013",
    			school: "Uppsala University",
    			education: "Bachelor's degree in Arabic"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Education> was created with unknown prop '${key}'`);
    	});

    	function escPress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const enterPress_handler = () => $$invalidate(1, displayInput = true);

    	function command_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$capture_state = () => ({
    		KeyPress,
    		Terminal,
    		Placeholder,
    		displayInput,
    		eduArray
    	});

    	$$self.$inject_state = $$props => {
    		if ('displayInput' in $$props) $$invalidate(1, displayInput = $$props.displayInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [eduArray, displayInput, escPress_handler, enterPress_handler, command_handler];
    }

    class Education extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { eduArray: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Education",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get eduArray() {
    		return this.$$.ctx[0];
    	}

    	set eduArray(value) {
    		throw new Error("<Education>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Directory.svelte generated by Svelte v3.42.5 */
    const file$6 = "src/components/Directory.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (42:4) {#each currentProjects as project}
    function create_each_block$3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t1_value = /*project*/ ctx[4].title + "";
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = text(".sys");
    			t3 = space();
    			if (!src_url_equal(img.src, img_src_value = "./img/folded-file.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "white paper folded in top right corner");
    			attr_dev(img, "class", "file svelte-16e9onl");
    			add_location(img, file$6, 43, 12, 1295);
    			add_location(h2, file$6, 44, 12, 1399);
    			attr_dev(div, "class", "card svelte-16e9onl");
    			add_location(div, file$6, 42, 8, 1264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h2);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentProjects*/ 1 && t1_value !== (t1_value = /*project*/ ctx[4].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(42:4) {#each currentProjects as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let each_value = /*currentProjects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "file-wrapper svelte-16e9onl");
    			add_location(div, file$6, 40, 0, 1190);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentProjects*/ 1) {
    				each_value = /*currentProjects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Directory', slots, []);
    	let { openDir } = $$props;
    	const dispatch = createEventDispatcher();

    	const projects = [
    		{
    			title: "game_of_life",
    			directory: "personal",
    			url: "https://p-sjunnestrand.github.io/game-of-life/"
    		},
    		{
    			title: "gridpainter",
    			directory: "personal",
    			url: "https://fed20d-grupp8-gridpainter.herokuapp.com/"
    		},
    		{
    			title: "trials_of_norns",
    			directory: "personal",
    			url: "https://p-sjunnestrand.github.io/trials-of-norns/"
    		},
    		{
    			title: "forca_fighting",
    			directory: "clients",
    			url: "https://forcafighting.com/"
    		}
    	];

    	let currentProjects = projects.filter(project => project.directory === openDir);

    	beforeUpdate(() => {
    		$$invalidate(0, currentProjects = projects.filter(project => project.directory === openDir));
    	});

    	onDestroy(() => {
    		dispatch('closeDir');
    	});

    	const writable_props = ['openDir'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Directory> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('openDir' in $$props) $$invalidate(1, openDir = $$props.openDir);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		onDestroy,
    		createEventDispatcher,
    		openDir,
    		dispatch,
    		projects,
    		currentProjects
    	});

    	$$self.$inject_state = $$props => {
    		if ('openDir' in $$props) $$invalidate(1, openDir = $$props.openDir);
    		if ('currentProjects' in $$props) $$invalidate(0, currentProjects = $$props.currentProjects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentProjects, openDir];
    }

    class Directory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { openDir: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Directory",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*openDir*/ ctx[1] === undefined && !('openDir' in props)) {
    			console.warn("<Directory> was created without expected prop 'openDir'");
    		}
    	}

    	get openDir() {
    		throw new Error("<Directory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openDir(value) {
    		throw new Error("<Directory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PortfolioFile.svelte generated by Svelte v3.42.5 */
    const file$5 = "src/components/PortfolioFile.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let a;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(/*openFile*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*fileDesc*/ ctx[1]);
    			t3 = space();
    			a = element("a");
    			t4 = text(/*fileUrl*/ ctx[2]);
    			attr_dev(h2, "class", "svelte-1ljrmrl");
    			add_location(h2, file$5, 30, 4, 623);
    			add_location(p, file$5, 31, 4, 647);
    			attr_dev(a, "href", /*fileUrl*/ ctx[2]);
    			add_location(a, file$5, 32, 4, 669);
    			attr_dev(div, "class", "fileWindow svelte-1ljrmrl");
    			add_location(div, file$5, 29, 0, 594);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			append_dev(div, a);
    			append_dev(a, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*openFile*/ 1) set_data_dev(t0, /*openFile*/ ctx[0]);
    			if (dirty & /*fileDesc*/ 2) set_data_dev(t2, /*fileDesc*/ ctx[1]);
    			if (dirty & /*fileUrl*/ 4) set_data_dev(t4, /*fileUrl*/ ctx[2]);

    			if (dirty & /*fileUrl*/ 4) {
    				attr_dev(a, "href", /*fileUrl*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PortfolioFile', slots, []);
    	let { openFile } = $$props;
    	let { fileDesc } = $$props;
    	let { fileUrl } = $$props;
    	const dispatch = createEventDispatcher();

    	onDestroy(() => {
    		dispatch('closeFile');
    	});

    	const writable_props = ['openFile', 'fileDesc', 'fileUrl'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PortfolioFile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('openFile' in $$props) $$invalidate(0, openFile = $$props.openFile);
    		if ('fileDesc' in $$props) $$invalidate(1, fileDesc = $$props.fileDesc);
    		if ('fileUrl' in $$props) $$invalidate(2, fileUrl = $$props.fileUrl);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		createEventDispatcher,
    		openFile,
    		fileDesc,
    		fileUrl,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('openFile' in $$props) $$invalidate(0, openFile = $$props.openFile);
    		if ('fileDesc' in $$props) $$invalidate(1, fileDesc = $$props.fileDesc);
    		if ('fileUrl' in $$props) $$invalidate(2, fileUrl = $$props.fileUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [openFile, fileDesc, fileUrl];
    }

    class PortfolioFile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { openFile: 0, fileDesc: 1, fileUrl: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PortfolioFile",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*openFile*/ ctx[0] === undefined && !('openFile' in props)) {
    			console.warn("<PortfolioFile> was created without expected prop 'openFile'");
    		}

    		if (/*fileDesc*/ ctx[1] === undefined && !('fileDesc' in props)) {
    			console.warn("<PortfolioFile> was created without expected prop 'fileDesc'");
    		}

    		if (/*fileUrl*/ ctx[2] === undefined && !('fileUrl' in props)) {
    			console.warn("<PortfolioFile> was created without expected prop 'fileUrl'");
    		}
    	}

    	get openFile() {
    		throw new Error("<PortfolioFile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openFile(value) {
    		throw new Error("<PortfolioFile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileDesc() {
    		throw new Error("<PortfolioFile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileDesc(value) {
    		throw new Error("<PortfolioFile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileUrl() {
    		throw new Error("<PortfolioFile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileUrl(value) {
    		throw new Error("<PortfolioFile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Portfolio.svelte generated by Svelte v3.42.5 */
    const file$4 = "src/components/Portfolio.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (44:0) {:else}
    function create_else_block_2(ctx) {
    	let keypress;
    	let current;
    	keypress = new KeyPress({ $$inline: true });
    	keypress.$on("escPress", /*escPress_handler_1*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(keypress.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(keypress, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keypress.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keypress.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keypress, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(44:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (42:0) {#if !openFile}
    function create_if_block_4$2(ctx) {
    	let keypress;
    	let current;
    	keypress = new KeyPress({ $$inline: true });
    	keypress.$on("escPress", /*escPress_handler*/ ctx[6]);
    	keypress.$on("enterPress", /*enterPress_handler*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(keypress.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(keypress, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keypress.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keypress.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keypress, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(42:0) {#if !openFile}",
    		ctx
    	});

    	return block;
    }

    // (59:4) {:else}
    function create_else_block_1$1(ctx) {
    	let div;
    	let each_value = /*dirArray*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "portfolio-wrapper svelte-1we0yoc");
    			add_location(div, file$4, 59, 8, 1705);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dirArray*/ 32) {
    				each_value = /*dirArray*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(59:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:23) 
    function create_if_block_3$2(ctx) {
    	let portfoliofile;
    	let current;

    	portfoliofile = new PortfolioFile({
    			props: {
    				openFile: /*openFile*/ ctx[0],
    				fileDesc: /*fileDesc*/ ctx[2],
    				fileUrl: /*fileUrl*/ ctx[3]
    			},
    			$$inline: true
    		});

    	portfoliofile.$on("closeFile", /*closeFile_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(portfoliofile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(portfoliofile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const portfoliofile_changes = {};
    			if (dirty & /*openFile*/ 1) portfoliofile_changes.openFile = /*openFile*/ ctx[0];
    			if (dirty & /*fileDesc*/ 4) portfoliofile_changes.fileDesc = /*fileDesc*/ ctx[2];
    			if (dirty & /*fileUrl*/ 8) portfoliofile_changes.fileUrl = /*fileUrl*/ ctx[3];
    			portfoliofile.$set(portfoliofile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(portfoliofile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(portfoliofile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(portfoliofile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(57:23) ",
    		ctx
    	});

    	return block;
    }

    // (55:4) {#if openDir}
    function create_if_block_2$2(ctx) {
    	let directory;
    	let current;

    	directory = new Directory({
    			props: { openDir: /*openDir*/ ctx[1] },
    			$$inline: true
    		});

    	directory.$on("closeDir", /*closeDir_handler*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(directory.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(directory, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const directory_changes = {};
    			if (dirty & /*openDir*/ 2) directory_changes.openDir = /*openDir*/ ctx[1];
    			directory.$set(directory_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(directory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(directory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(directory, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(55:4) {#if openDir}",
    		ctx
    	});

    	return block;
    }

    // (61:12) {#each dirArray as dir}
    function create_each_block$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t1_value = /*dir*/ ctx[12] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			if (!src_url_equal(img.src, img_src_value = "./img/dir.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "A file directory");
    			attr_dev(img, "class", "dir-image svelte-1we0yoc");
    			add_location(img, file$4, 62, 16, 1820);
    			add_location(h2, file$4, 63, 16, 1903);
    			attr_dev(div, "class", "card");
    			add_location(div, file$4, 61, 12, 1785);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h2);
    			append_dev(h2, t1);
    			append_dev(div, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(61:12) {#each dirArray as dir}",
    		ctx
    	});

    	return block;
    }

    // (74:0) {:else}
    function create_else_block$4(ctx) {
    	let terminal;
    	let current;
    	terminal = new Terminal({ $$inline: true });
    	terminal.$on("command", /*command_handler*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(terminal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(terminal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(terminal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(terminal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(terminal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(74:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (72:19) 
    function create_if_block_1$2(ctx) {
    	let placeholder;
    	let current;
    	placeholder = new Placeholder({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(placeholder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(72:19) ",
    		ctx
    	});

    	return block;
    }

    // (70:0) {#if !displayInput}
    function create_if_block$4(ctx) {
    	let placeholder;
    	let current;

    	placeholder = new Placeholder({
    			props: { terminal: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(placeholder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(70:0) {#if !displayInput}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let article;
    	let div;
    	let h1;
    	let t2;
    	let p0;
    	let t3;
    	let span0;
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let span1;
    	let t9;
    	let t10;
    	let p2;
    	let t11;
    	let span2;
    	let t13;
    	let t14;
    	let p3;
    	let t15;
    	let span3;
    	let t17;
    	let t18;
    	let current_block_type_index_1;
    	let if_block1;
    	let t19;
    	let current_block_type_index_2;
    	let if_block2;
    	let if_block2_anchor;
    	let current;
    	const if_block_creators = [create_if_block_4$2, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*openFile*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block_2$2, create_if_block_3$2, create_else_block_1$1];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*openDir*/ ctx[1]) return 0;
    		if (/*openFile*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    	const if_block_creators_2 = [create_if_block$4, create_if_block_1$2, create_else_block$4];
    	const if_blocks_2 = [];

    	function select_block_type_2(ctx, dirty) {
    		if (!/*displayInput*/ ctx[4]) return 0;
    		if (/*openFile*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index_2 = select_block_type_2(ctx);
    	if_block2 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t0 = space();
    			article = element("article");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "PORTFOLIO";
    			t2 = space();
    			p0 = element("p");
    			t3 = text("Input ");
    			span0 = element("span");
    			span0.textContent = "> open -d [directory]";
    			t5 = text(" to open directory");
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Input ");
    			span1 = element("span");
    			span1.textContent = "> open -f [file]";
    			t9 = text(" to open file");
    			t10 = space();
    			p2 = element("p");
    			t11 = text("Input ");
    			span2 = element("span");
    			span2.textContent = "> cd ..";
    			t13 = text(" to close directory");
    			t14 = space();
    			p3 = element("p");
    			t15 = text("Input ");
    			span3 = element("span");
    			span3.textContent = "> help";
    			t17 = text(" for list of commands");
    			t18 = space();
    			if_block1.c();
    			t19 = space();
    			if_block2.c();
    			if_block2_anchor = empty();
    			add_location(h1, file$4, 48, 8, 1187);
    			attr_dev(span0, "class", "code");
    			add_location(span0, file$4, 49, 17, 1223);
    			add_location(p0, file$4, 49, 8, 1214);
    			attr_dev(span1, "class", "code");
    			add_location(span1, file$4, 50, 17, 1310);
    			add_location(p1, file$4, 50, 8, 1301);
    			attr_dev(span2, "class", "code");
    			add_location(span2, file$4, 51, 17, 1387);
    			add_location(p2, file$4, 51, 8, 1378);
    			attr_dev(span3, "class", "code");
    			add_location(span3, file$4, 52, 17, 1461);
    			add_location(p3, file$4, 52, 8, 1452);
    			attr_dev(div, "class", "header");
    			add_location(div, file$4, 47, 4, 1158);
    			attr_dev(article, "class", "svelte-1we0yoc");
    			add_location(article, file$4, 46, 0, 1144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, p0);
    			append_dev(p0, t3);
    			append_dev(p0, span0);
    			append_dev(p0, t5);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(p1, span1);
    			append_dev(p1, t9);
    			append_dev(div, t10);
    			append_dev(div, p2);
    			append_dev(p2, t11);
    			append_dev(p2, span2);
    			append_dev(p2, t13);
    			append_dev(div, t14);
    			append_dev(div, p3);
    			append_dev(p3, t15);
    			append_dev(p3, span3);
    			append_dev(p3, t17);
    			append_dev(article, t18);
    			if_blocks_1[current_block_type_index_1].m(article, null);
    			insert_dev(target, t19, anchor);
    			if_blocks_2[current_block_type_index_2].m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t0.parentNode, t0);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(article, null);
    			}

    			let previous_block_index_2 = current_block_type_index_2;
    			current_block_type_index_2 = select_block_type_2(ctx);

    			if (current_block_type_index_2 !== previous_block_index_2) {
    				group_outros();

    				transition_out(if_blocks_2[previous_block_index_2], 1, 1, () => {
    					if_blocks_2[previous_block_index_2] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks_2[current_block_type_index_2];

    				if (!if_block2) {
    					if_block2 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);
    					if_block2.c();
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article);
    			if_blocks_1[current_block_type_index_1].d();
    			if (detaching) detach_dev(t19);
    			if_blocks_2[current_block_type_index_2].d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Portfolio', slots, []);
    	let { openFile } = $$props;
    	let { openDir } = $$props;
    	let { fileDesc } = $$props;
    	let { fileUrl } = $$props;
    	let displayInput = false;
    	const dirArray = ["personal", "clients"];
    	const writable_props = ['openFile', 'openDir', 'fileDesc', 'fileUrl'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	function escPress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const enterPress_handler = () => $$invalidate(4, displayInput = true);

    	function escPress_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function closeDir_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function closeFile_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function command_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('openFile' in $$props) $$invalidate(0, openFile = $$props.openFile);
    		if ('openDir' in $$props) $$invalidate(1, openDir = $$props.openDir);
    		if ('fileDesc' in $$props) $$invalidate(2, fileDesc = $$props.fileDesc);
    		if ('fileUrl' in $$props) $$invalidate(3, fileUrl = $$props.fileUrl);
    	};

    	$$self.$capture_state = () => ({
    		KeyPress,
    		Terminal,
    		Directory,
    		Placeholder,
    		PortfolioFile,
    		openFile,
    		openDir,
    		fileDesc,
    		fileUrl,
    		displayInput,
    		dirArray
    	});

    	$$self.$inject_state = $$props => {
    		if ('openFile' in $$props) $$invalidate(0, openFile = $$props.openFile);
    		if ('openDir' in $$props) $$invalidate(1, openDir = $$props.openDir);
    		if ('fileDesc' in $$props) $$invalidate(2, fileDesc = $$props.fileDesc);
    		if ('fileUrl' in $$props) $$invalidate(3, fileUrl = $$props.fileUrl);
    		if ('displayInput' in $$props) $$invalidate(4, displayInput = $$props.displayInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		openFile,
    		openDir,
    		fileDesc,
    		fileUrl,
    		displayInput,
    		dirArray,
    		escPress_handler,
    		enterPress_handler,
    		escPress_handler_1,
    		closeDir_handler,
    		closeFile_handler,
    		command_handler
    	];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			openFile: 0,
    			openDir: 1,
    			fileDesc: 2,
    			fileUrl: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*openFile*/ ctx[0] === undefined && !('openFile' in props)) {
    			console.warn("<Portfolio> was created without expected prop 'openFile'");
    		}

    		if (/*openDir*/ ctx[1] === undefined && !('openDir' in props)) {
    			console.warn("<Portfolio> was created without expected prop 'openDir'");
    		}

    		if (/*fileDesc*/ ctx[2] === undefined && !('fileDesc' in props)) {
    			console.warn("<Portfolio> was created without expected prop 'fileDesc'");
    		}

    		if (/*fileUrl*/ ctx[3] === undefined && !('fileUrl' in props)) {
    			console.warn("<Portfolio> was created without expected prop 'fileUrl'");
    		}
    	}

    	get openFile() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openFile(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openDir() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openDir(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileDesc() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileDesc(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileUrl() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileUrl(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Specs.svelte generated by Svelte v3.42.5 */
    const file$3 = "src/components/Specs.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (248:24) {#each dotArray as dot}
    function create_each_block_1(ctx) {
    	let t_value = /*dot*/ ctx[19] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dotArray*/ 16 && t_value !== (t_value = /*dot*/ ctx[19] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(248:24) {#each dotArray as dot}",
    		ctx
    	});

    	return block;
    }

    // (257:28) {#each randomStringArray as randomString}
    function create_each_block$1(ctx) {
    	let li;
    	let t_value = /*randomString*/ ctx[16] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-qef8v1");
    			add_location(li, file$3, 257, 32, 5609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*randomStringArray*/ 32 && t_value !== (t_value = /*randomString*/ ctx[16] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(257:28) {#each randomStringArray as randomString}",
    		ctx
    	});

    	return block;
    }

    // (287:0) {:else}
    function create_else_block$3(ctx) {
    	let terminal;
    	let current;
    	terminal = new Terminal({ $$inline: true });
    	terminal.$on("command", /*command_handler*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(terminal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(terminal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(terminal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(terminal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(terminal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(287:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (285:0) {#if !displayInput}
    function create_if_block$3(ctx) {
    	let placeholder;
    	let current;

    	placeholder = new Placeholder({
    			props: { terminal: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(placeholder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(placeholder, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(placeholder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(placeholder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(placeholder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(285:0) {#if !displayInput}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let keypress;
    	let t0;
    	let article;
    	let div0;
    	let h1;
    	let t2;
    	let p;
    	let t3;
    	let span;
    	let t5;
    	let t6;
    	let section;
    	let div1;
    	let ul0;
    	let li0;
    	let t8;
    	let li1;
    	let t10;
    	let li2;
    	let t12;
    	let li3;
    	let t14;
    	let li4;
    	let t16;
    	let ul1;
    	let li5;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let li6;
    	let t22;
    	let li7;
    	let t23;
    	let t24;
    	let t25;
    	let li8;
    	let t27;
    	let li9;
    	let t28;
    	let t29;
    	let t30;
    	let t31;
    	let div15;
    	let div13;
    	let div3;
    	let h20;
    	let t33;
    	let div2;
    	let t34;
    	let div5;
    	let h21;
    	let t36;
    	let div4;
    	let ul2;
    	let t37;
    	let div12;
    	let h22;
    	let t39;
    	let div11;
    	let div6;
    	let t40;
    	let div7;
    	let t41;
    	let div8;
    	let t42;
    	let div9;
    	let t43;
    	let div10;
    	let t44;
    	let div14;
    	let t45;
    	let br0;
    	let br1;
    	let t46;
    	let t47;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	keypress = new KeyPress({ $$inline: true });
    	keypress.$on("escPress", /*escPress_handler*/ ctx[6]);
    	keypress.$on("enterPress", /*enterPress_handler*/ ctx[7]);
    	let each_value_1 = /*dotArray*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*randomStringArray*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const if_block_creators = [create_if_block$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*displayInput*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(keypress.$$.fragment);
    			t0 = space();
    			article = element("article");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Specs";
    			t2 = space();
    			p = element("p");
    			t3 = text("Input ");
    			span = element("span");
    			span.textContent = "> help";
    			t5 = text(" for list of commands.");
    			t6 = space();
    			section = element("section");
    			div1 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Delta-harmonics tribulation at";
    			t8 = space();
    			li1 = element("li");
    			li1.textContent = "Multi spectrum quantifier modulation";
    			t10 = space();
    			li2 = element("li");
    			li2.textContent = "Spectrostatic hypo-flux at";
    			t12 = space();
    			li3 = element("li");
    			li3.textContent = "Crypto-encabulator running at";
    			t14 = space();
    			li4 = element("li");
    			li4.textContent = "Linear phase scattering";
    			t16 = space();
    			ul1 = element("ul");
    			li5 = element("li");
    			t17 = text(".");
    			t18 = text(/*delta*/ ctx[1]);
    			t19 = text("gPz. 1000 fracutations/ms");
    			t20 = space();
    			li6 = element("li");
    			li6.textContent = ".01-α through 600-λ";
    			t22 = space();
    			li7 = element("li");
    			t23 = text(/*hypoflux*/ ctx[2]);
    			t24 = text("/900γ");
    			t25 = space();
    			li8 = element("li");
    			li8.textContent = "stable";
    			t27 = space();
    			li9 = element("li");
    			t28 = text("∑");
    			t29 = text(/*crypto*/ ctx[3]);
    			t30 = text("/1600V");
    			t31 = space();
    			div15 = element("div");
    			div13 = element("div");
    			div3 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Panametric nanoflux instabilities";
    			t33 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t34 = space();
    			div5 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Bodkin spilwave parameters ( 20spn margin)";
    			t36 = space();
    			div4 = element("div");
    			ul2 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t37 = space();
    			div12 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Monophasic vectorized oscilation";
    			t39 = space();
    			div11 = element("div");
    			div6 = element("div");
    			t40 = space();
    			div7 = element("div");
    			t41 = space();
    			div8 = element("div");
    			t42 = space();
    			div9 = element("div");
    			t43 = space();
    			div10 = element("div");
    			t44 = space();
    			div14 = element("div");
    			t45 = text("This version of the Petter Sjunnestrand (Autonomous Pseudo-Voltonic Lewitt-Hoffenfeld Manifold), operates through pan-muonic argegate fields, resulting in a greater GDSL-4 output compared to its precursors.\n                As per the Mononoki-Lundqvist effect, the more radical zeta zeta pattern generated by the argegate fields' cyclospin must be countered through stoechiometallic ionidization in the flux inhibitor cells.\n                Typical output should not exceed 400 p/y, not accounting for any hermetic vibrosion and imaginary voltage. In most cases, Moussorgski spin generated through encabulation of the magnastic heliosphere will negate any spike in epsilon modulated space, thus preventing a runaway voynichian reaction.\n                To maintain a good marigin of safety, the non-euclidian 3-brane fluids should be changed at least quarterly. If none is available, olive oil should work as well.\n                ");
    			br0 = element("br");
    			br1 = element("br");
    			t46 = text("\n                For information on maintenance or general questions regarding the Petter Sjunnestrand, please contact p.sjunnestrand@gmail.com.");
    			t47 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$3, 222, 8, 4200);
    			attr_dev(span, "class", "code");
    			add_location(span, file$3, 223, 17, 4232);
    			add_location(p, file$3, 223, 8, 4223);
    			attr_dev(div0, "class", "header");
    			add_location(div0, file$3, 221, 4, 4171);
    			attr_dev(li0, "class", "svelte-qef8v1");
    			add_location(li0, file$3, 228, 16, 4403);
    			attr_dev(li1, "class", "svelte-qef8v1");
    			add_location(li1, file$3, 229, 16, 4459);
    			attr_dev(li2, "class", "svelte-qef8v1");
    			add_location(li2, file$3, 230, 16, 4521);
    			attr_dev(li3, "class", "svelte-qef8v1");
    			add_location(li3, file$3, 231, 16, 4573);
    			attr_dev(li4, "class", "svelte-qef8v1");
    			add_location(li4, file$3, 232, 16, 4628);
    			attr_dev(ul0, "class", "tech-talk svelte-qef8v1");
    			add_location(ul0, file$3, 227, 12, 4364);
    			attr_dev(li5, "class", "svelte-qef8v1");
    			add_location(li5, file$3, 235, 16, 4712);
    			attr_dev(li6, "class", "svelte-qef8v1");
    			add_location(li6, file$3, 236, 16, 4771);
    			attr_dev(li7, "class", "svelte-qef8v1");
    			add_location(li7, file$3, 237, 16, 4816);
    			attr_dev(li8, "class", "svelte-qef8v1");
    			add_location(li8, file$3, 238, 16, 4857);
    			attr_dev(li9, "class", "svelte-qef8v1");
    			add_location(li9, file$3, 239, 16, 4889);
    			attr_dev(ul1, "class", "svelte-qef8v1");
    			add_location(ul1, file$3, 234, 12, 4691);
    			attr_dev(div1, "class", "statusWrapper svelte-qef8v1");
    			add_location(div1, file$3, 226, 8, 4324);
    			attr_dev(h20, "class", "svelte-qef8v1");
    			add_location(h20, file$3, 245, 20, 5075);
    			attr_dev(div2, "class", "dots svelte-qef8v1");
    			add_location(div2, file$3, 246, 20, 5138);
    			attr_dev(div3, "class", "nanoflux svelte-qef8v1");
    			add_location(div3, file$3, 244, 16, 5032);
    			attr_dev(h21, "class", "svelte-qef8v1");
    			add_location(h21, file$3, 253, 20, 5378);
    			attr_dev(ul2, "class", "svelte-qef8v1");
    			add_location(ul2, file$3, 255, 24, 5502);
    			attr_dev(div4, "class", "randomStrings svelte-qef8v1");
    			add_location(div4, file$3, 254, 20, 5450);
    			attr_dev(div5, "class", "bodkin svelte-qef8v1");
    			add_location(div5, file$3, 252, 16, 5337);
    			attr_dev(h22, "class", "svelte-qef8v1");
    			add_location(h22, file$3, 263, 20, 5803);
    			attr_dev(div6, "class", "bar svelte-qef8v1");
    			add_location(div6, file$3, 265, 24, 5915);
    			attr_dev(div7, "class", "bar svelte-qef8v1");
    			add_location(div7, file$3, 266, 24, 5963);
    			attr_dev(div8, "class", "bar svelte-qef8v1");
    			add_location(div8, file$3, 267, 24, 6011);
    			attr_dev(div9, "class", "bar svelte-qef8v1");
    			add_location(div9, file$3, 268, 24, 6059);
    			attr_dev(div10, "class", "bar svelte-qef8v1");
    			add_location(div10, file$3, 269, 24, 6107);
    			attr_dev(div11, "class", "mvo-wrapper svelte-qef8v1");
    			add_location(div11, file$3, 264, 20, 5865);
    			attr_dev(div12, "class", "mvo svelte-qef8v1");
    			add_location(div12, file$3, 262, 16, 5765);
    			attr_dev(div13, "class", "first-column svelte-qef8v1");
    			add_location(div13, file$3, 243, 12, 4989);
    			add_location(br0, file$3, 278, 16, 7187);
    			add_location(br1, file$3, 278, 20, 7191);
    			attr_dev(div14, "class", "second-column svelte-qef8v1");
    			add_location(div14, file$3, 273, 12, 6212);
    			attr_dev(div15, "class", "visuals svelte-qef8v1");
    			add_location(div15, file$3, 242, 8, 4955);
    			add_location(section, file$3, 225, 4, 4306);
    			attr_dev(article, "class", "specs-main svelte-qef8v1");
    			add_location(article, file$3, 220, 0, 4138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(keypress, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(p, span);
    			append_dev(p, t5);
    			append_dev(article, t6);
    			append_dev(article, section);
    			append_dev(section, div1);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t8);
    			append_dev(ul0, li1);
    			append_dev(ul0, t10);
    			append_dev(ul0, li2);
    			append_dev(ul0, t12);
    			append_dev(ul0, li3);
    			append_dev(ul0, t14);
    			append_dev(ul0, li4);
    			append_dev(div1, t16);
    			append_dev(div1, ul1);
    			append_dev(ul1, li5);
    			append_dev(li5, t17);
    			append_dev(li5, t18);
    			append_dev(li5, t19);
    			append_dev(ul1, t20);
    			append_dev(ul1, li6);
    			append_dev(ul1, t22);
    			append_dev(ul1, li7);
    			append_dev(li7, t23);
    			append_dev(li7, t24);
    			append_dev(ul1, t25);
    			append_dev(ul1, li8);
    			append_dev(ul1, t27);
    			append_dev(ul1, li9);
    			append_dev(li9, t28);
    			append_dev(li9, t29);
    			append_dev(li9, t30);
    			append_dev(section, t31);
    			append_dev(section, div15);
    			append_dev(div15, div13);
    			append_dev(div13, div3);
    			append_dev(div3, h20);
    			append_dev(div3, t33);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div13, t34);
    			append_dev(div13, div5);
    			append_dev(div5, h21);
    			append_dev(div5, t36);
    			append_dev(div5, div4);
    			append_dev(div4, ul2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul2, null);
    			}

    			append_dev(div13, t37);
    			append_dev(div13, div12);
    			append_dev(div12, h22);
    			append_dev(div12, t39);
    			append_dev(div12, div11);
    			append_dev(div11, div6);
    			append_dev(div11, t40);
    			append_dev(div11, div7);
    			append_dev(div11, t41);
    			append_dev(div11, div8);
    			append_dev(div11, t42);
    			append_dev(div11, div9);
    			append_dev(div11, t43);
    			append_dev(div11, div10);
    			append_dev(div15, t44);
    			append_dev(div15, div14);
    			append_dev(div14, t45);
    			append_dev(div14, br0);
    			append_dev(div14, br1);
    			append_dev(div14, t46);
    			insert_dev(target, t47, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*delta*/ 2) set_data_dev(t18, /*delta*/ ctx[1]);
    			if (!current || dirty & /*hypoflux*/ 4) set_data_dev(t23, /*hypoflux*/ ctx[2]);
    			if (!current || dirty & /*crypto*/ 8) set_data_dev(t29, /*crypto*/ ctx[3]);

    			if (dirty & /*dotArray*/ 16) {
    				each_value_1 = /*dotArray*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*randomStringArray*/ 32) {
    				each_value = /*randomStringArray*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keypress.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keypress.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(keypress, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t47);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Specs', slots, []);
    	let displayInput = false;
    	let delta = 11;
    	let hypoflux = 13;
    	let crypto = 4;
    	let dotArray = Array(35).fill('.');
    	const progressDots = ['.', ':'];
    	let randomStringArray = [];
    	let mvoMatrix = Array(10).fill().map(() => Array(6).fill(0));

    	const setValues = () => {
    		$$invalidate(1, delta = Math.floor(Math.random() * 90 + 10));
    		$$invalidate(2, hypoflux = Math.floor(Math.random() * 4 + 12));
    		$$invalidate(3, crypto = Math.floor(Math.random() * 3 + 3));
    		$$invalidate(4, dotArray = runDotArray());
    		$$invalidate(5, randomStringArray = makeRandomString());
    	}; // runMatrix();

    	const interval = setInterval(setValues, 1000);

    	const makeRandomString = () => {
    		let newRandomStringArray = randomStringArray.slice();
    		let newRandomString = '';
    		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    		const charactersLength = characters.length;

    		for (let i = 0; i < 41; i++) {
    			newRandomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    		}

    		newRandomStringArray.push(newRandomString);

    		if (newRandomStringArray.length > 9) {
    			newRandomStringArray.shift();
    		}

    		return newRandomStringArray;
    	};

    	const runDotArray = () => {
    		const randomDot = Math.floor(Math.random() * 2);
    		let newDotArray = dotArray.slice();
    		newDotArray.push(progressDots[randomDot]);
    		newDotArray.shift();
    		return newDotArray;
    	};

    	const runMatrix = () => {
    		for (let i = 0; i < mvoMatrix.length; i++) {
    			for (let j = 0; j < mvoMatrix[i].length; j++) {
    				mvoMatrix[i][j] = Math.floor(Math.random() * 2);
    			}
    		}
    	};

    	onDestroy(() => {
    		clearInterval(interval);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Specs> was created with unknown prop '${key}'`);
    	});

    	function escPress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const enterPress_handler = () => $$invalidate(0, displayInput = true);

    	function command_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		KeyPress,
    		Terminal,
    		Placeholder,
    		displayInput,
    		delta,
    		hypoflux,
    		crypto,
    		dotArray,
    		progressDots,
    		randomStringArray,
    		mvoMatrix,
    		setValues,
    		interval,
    		makeRandomString,
    		runDotArray,
    		runMatrix
    	});

    	$$self.$inject_state = $$props => {
    		if ('displayInput' in $$props) $$invalidate(0, displayInput = $$props.displayInput);
    		if ('delta' in $$props) $$invalidate(1, delta = $$props.delta);
    		if ('hypoflux' in $$props) $$invalidate(2, hypoflux = $$props.hypoflux);
    		if ('crypto' in $$props) $$invalidate(3, crypto = $$props.crypto);
    		if ('dotArray' in $$props) $$invalidate(4, dotArray = $$props.dotArray);
    		if ('randomStringArray' in $$props) $$invalidate(5, randomStringArray = $$props.randomStringArray);
    		if ('mvoMatrix' in $$props) mvoMatrix = $$props.mvoMatrix;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		displayInput,
    		delta,
    		hypoflux,
    		crypto,
    		dotArray,
    		randomStringArray,
    		escPress_handler,
    		enterPress_handler,
    		command_handler
    	];
    }

    class Specs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Specs",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Console.svelte generated by Svelte v3.42.5 */
    const file$2 = "src/components/Console.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (73:12) {:else}
    function create_else_block$2(ctx) {
    	let li;
    	let t_value = /*command*/ ctx[2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-d493j8");
    			add_location(li, file$2, 73, 16, 2572);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*consoleArray*/ 1 && t_value !== (t_value = /*command*/ ctx[2] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(73:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:12) {#if command === "help"}
    function create_if_block$2(ctx) {
    	let div0;
    	let h2;
    	let t1;
    	let li0;
    	let span0;
    	let t3;
    	let t4;
    	let li7;
    	let p;
    	let t6;
    	let ul;
    	let li1;
    	let t8;
    	let li2;
    	let t10;
    	let li3;
    	let t12;
    	let li4;
    	let t14;
    	let li5;
    	let t16;
    	let li6;
    	let t18;
    	let li8;
    	let span1;
    	let t20;
    	let t21;
    	let li9;
    	let span2;
    	let t23;
    	let t24;
    	let li10;
    	let span3;
    	let t26;
    	let t27;
    	let li11;
    	let span4;
    	let t29;
    	let t30;
    	let li12;
    	let span5;
    	let t32;
    	let t33;
    	let li13;
    	let span6;
    	let t35;
    	let t36;
    	let li14;
    	let span7;
    	let t38;
    	let t39;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "HELP";
    			t1 = space();
    			li0 = element("li");
    			span0 = element("span");
    			span0.textContent = "> run -p [program]";
    			t3 = text(" runs program");
    			t4 = space();
    			li7 = element("li");
    			p = element("p");
    			p.textContent = "List of programs to run:";
    			t6 = space();
    			ul = element("ul");
    			li1 = element("li");
    			li1.textContent = "main";
    			t8 = space();
    			li2 = element("li");
    			li2.textContent = "modules";
    			t10 = space();
    			li3 = element("li");
    			li3.textContent = "work";
    			t12 = space();
    			li4 = element("li");
    			li4.textContent = "edu";
    			t14 = space();
    			li5 = element("li");
    			li5.textContent = "portf";
    			t16 = space();
    			li6 = element("li");
    			li6.textContent = "specs";
    			t18 = space();
    			li8 = element("li");
    			span1 = element("span");
    			span1.textContent = "> sys exit -u";
    			t20 = text(" logs user out to login screen");
    			t21 = space();
    			li9 = element("li");
    			span2 = element("span");
    			span2.textContent = "> sys shutdown -n";
    			t23 = text(" shuts computer down");
    			t24 = space();
    			li10 = element("li");
    			span3 = element("span");
    			span3.textContent = "> sys shutdown [seconds]";
    			t26 = text(" shuts computer down after specificed amount of seconds");
    			t27 = space();
    			li11 = element("li");
    			span4 = element("span");
    			span4.textContent = "> sys color [color]";
    			t29 = text(" changes background color to specified valid hex color");
    			t30 = space();
    			li12 = element("li");
    			span5 = element("span");
    			span5.textContent = "> sys color -r";
    			t32 = text(" resets background color");
    			t33 = space();
    			li13 = element("li");
    			span6 = element("span");
    			span6.textContent = "> open -f [file]";
    			t35 = text(" opens specified file (portf, modules, work?, edu?)");
    			t36 = space();
    			li14 = element("li");
    			span7 = element("span");
    			span7.textContent = "> open -d [directory]";
    			t38 = text(" opens specified directory (portf, work?, edu?)");
    			t39 = space();
    			div1 = element("div");
    			div1.textContent = "END OF HELP";
    			add_location(h2, file$2, 49, 24, 1033);
    			attr_dev(span0, "class", "code svelte-d493j8");
    			add_location(span0, file$2, 50, 28, 1075);
    			attr_dev(li0, "class", "svelte-d493j8");
    			add_location(li0, file$2, 50, 24, 1071);
    			add_location(p, file$2, 52, 28, 1195);
    			attr_dev(li1, "class", "svelte-d493j8");
    			add_location(li1, file$2, 54, 32, 1292);
    			attr_dev(li2, "class", "svelte-d493j8");
    			add_location(li2, file$2, 55, 32, 1338);
    			attr_dev(li3, "class", "svelte-d493j8");
    			add_location(li3, file$2, 56, 32, 1387);
    			attr_dev(li4, "class", "svelte-d493j8");
    			add_location(li4, file$2, 57, 32, 1433);
    			attr_dev(li5, "class", "svelte-d493j8");
    			add_location(li5, file$2, 58, 32, 1478);
    			attr_dev(li6, "class", "svelte-d493j8");
    			add_location(li6, file$2, 59, 32, 1525);
    			add_location(ul, file$2, 53, 28, 1255);
    			attr_dev(li7, "class", "svelte-d493j8");
    			add_location(li7, file$2, 51, 24, 1162);
    			attr_dev(span1, "class", "code svelte-d493j8");
    			add_location(span1, file$2, 62, 28, 1632);
    			attr_dev(li8, "class", "svelte-d493j8");
    			add_location(li8, file$2, 62, 24, 1628);
    			attr_dev(span2, "class", "code svelte-d493j8");
    			add_location(span2, file$2, 63, 28, 1735);
    			attr_dev(li9, "class", "svelte-d493j8");
    			add_location(li9, file$2, 63, 24, 1731);
    			attr_dev(span3, "class", "code svelte-d493j8");
    			add_location(span3, file$2, 64, 28, 1832);
    			attr_dev(li10, "class", "svelte-d493j8");
    			add_location(li10, file$2, 64, 24, 1828);
    			attr_dev(span4, "class", "code svelte-d493j8");
    			add_location(span4, file$2, 65, 28, 1971);
    			attr_dev(li11, "class", "svelte-d493j8");
    			add_location(li11, file$2, 65, 24, 1967);
    			attr_dev(span5, "class", "code svelte-d493j8");
    			add_location(span5, file$2, 66, 28, 2104);
    			attr_dev(li12, "class", "svelte-d493j8");
    			add_location(li12, file$2, 66, 24, 2100);
    			attr_dev(span6, "class", "code svelte-d493j8");
    			add_location(span6, file$2, 67, 28, 2202);
    			attr_dev(li13, "class", "svelte-d493j8");
    			add_location(li13, file$2, 67, 24, 2198);
    			attr_dev(span7, "class", "code svelte-d493j8");
    			add_location(span7, file$2, 68, 28, 2329);
    			attr_dev(li14, "class", "svelte-d493j8");
    			add_location(li14, file$2, 68, 24, 2325);
    			attr_dev(div0, "class", "help svelte-d493j8");
    			add_location(div0, file$2, 48, 20, 990);
    			attr_dev(div1, "class", "end-message svelte-d493j8");
    			add_location(div1, file$2, 70, 20, 2476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, li0);
    			append_dev(li0, span0);
    			append_dev(li0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, li7);
    			append_dev(li7, p);
    			append_dev(li7, t6);
    			append_dev(li7, ul);
    			append_dev(ul, li1);
    			append_dev(ul, t8);
    			append_dev(ul, li2);
    			append_dev(ul, t10);
    			append_dev(ul, li3);
    			append_dev(ul, t12);
    			append_dev(ul, li4);
    			append_dev(ul, t14);
    			append_dev(ul, li5);
    			append_dev(ul, t16);
    			append_dev(ul, li6);
    			append_dev(div0, t18);
    			append_dev(div0, li8);
    			append_dev(li8, span1);
    			append_dev(li8, t20);
    			append_dev(div0, t21);
    			append_dev(div0, li9);
    			append_dev(li9, span2);
    			append_dev(li9, t23);
    			append_dev(div0, t24);
    			append_dev(div0, li10);
    			append_dev(li10, span3);
    			append_dev(li10, t26);
    			append_dev(div0, t27);
    			append_dev(div0, li11);
    			append_dev(li11, span4);
    			append_dev(li11, t29);
    			append_dev(div0, t30);
    			append_dev(div0, li12);
    			append_dev(li12, span5);
    			append_dev(li12, t32);
    			append_dev(div0, t33);
    			append_dev(div0, li13);
    			append_dev(li13, span6);
    			append_dev(li13, t35);
    			append_dev(div0, t36);
    			append_dev(div0, li14);
    			append_dev(li14, span7);
    			append_dev(li14, t38);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(48:12) {#if command === \\\"help\\\"}",
    		ctx
    	});

    	return block;
    }

    // (47:8) {#each consoleArray as command}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*command*/ ctx[2] === "help") return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(47:8) {#each consoleArray as command}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let article;
    	let div;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t4;
    	let span;
    	let t6;
    	let t7;
    	let ul;
    	let t8;
    	let terminal;
    	let current;
    	let each_value = /*consoleArray*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	terminal = new Terminal({ $$inline: true });
    	terminal.$on("command", /*command_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			article = element("article");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "CONSOLE";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Input commands to execute.";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Input ");
    			span = element("span");
    			span.textContent = "> help";
    			t6 = text(" for list of commands.");
    			t7 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			create_component(terminal.$$.fragment);
    			attr_dev(h1, "class", "svelte-d493j8");
    			add_location(h1, file$2, 41, 8, 738);
    			add_location(p0, file$2, 42, 8, 763);
    			attr_dev(span, "class", "code svelte-d493j8");
    			add_location(span, file$2, 43, 17, 814);
    			add_location(p1, file$2, 43, 8, 805);
    			attr_dev(div, "class", "header svelte-d493j8");
    			add_location(div, file$2, 40, 4, 709);
    			add_location(ul, file$2, 45, 4, 888);
    			attr_dev(article, "class", "svelte-d493j8");
    			add_location(article, file$2, 39, 0, 695);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			append_dev(p1, t4);
    			append_dev(p1, span);
    			append_dev(p1, t6);
    			append_dev(article, t7);
    			append_dev(article, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t8, anchor);
    			mount_component(terminal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*consoleArray*/ 1) {
    				each_value = /*consoleArray*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(terminal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(terminal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(terminal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Console', slots, []);
    	let { consoleArray } = $$props;
    	const writable_props = ['consoleArray'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Console> was created with unknown prop '${key}'`);
    	});

    	function command_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('consoleArray' in $$props) $$invalidate(0, consoleArray = $$props.consoleArray);
    	};

    	$$self.$capture_state = () => ({ Terminal, consoleArray });

    	$$self.$inject_state = $$props => {
    		if ('consoleArray' in $$props) $$invalidate(0, consoleArray = $$props.consoleArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [consoleArray, command_handler];
    }

    class Console extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { consoleArray: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Console",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*consoleArray*/ ctx[0] === undefined && !('consoleArray' in props)) {
    			console.warn("<Console> was created without expected prop 'consoleArray'");
    		}
    	}

    	get consoleArray() {
    		throw new Error("<Console>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set consoleArray(value) {
    		throw new Error("<Console>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Main.svelte generated by Svelte v3.42.5 */

    const { console: console_2 } = globals;
    const file$1 = "src/Main.svelte";

    // (209:8) {:else}
    function create_else_block$1(ctx) {
    	let console_1;
    	let current;

    	console_1 = new Console({
    			props: { consoleArray: /*consoleArray*/ ctx[1] },
    			$$inline: true
    		});

    	console_1.$on("command", /*execCommand*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(console_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(console_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const console_1_changes = {};
    			if (dirty & /*consoleArray*/ 2) console_1_changes.consoleArray = /*consoleArray*/ ctx[1];
    			console_1.$set(console_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(console_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(console_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(console_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(209:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (195:8) {#if !displayConsole}
    function create_if_block_1$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block_2$1,
    		create_if_block_3$1,
    		create_if_block_4$1,
    		create_if_block_5$1,
    		create_if_block_6,
    		create_if_block_7
    	];

    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*pageDisplay*/ ctx[3] === "main") return 0;
    		if (/*pageDisplay*/ ctx[3] === "modules") return 1;
    		if (/*pageDisplay*/ ctx[3] === "work") return 2;
    		if (/*pageDisplay*/ ctx[3] === "edu") return 3;
    		if (/*pageDisplay*/ ctx[3] === "portf") return 4;
    		if (/*pageDisplay*/ ctx[3] === "specs") return 5;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(195:8) {#if !displayConsole}",
    		ctx
    	});

    	return block;
    }

    // (192:4) {#if !logoFinished}
    function create_if_block$1(ctx) {
    	let welcomelogo;
    	let current;
    	welcomelogo = new WelcomeLogo({ $$inline: true });
    	welcomelogo.$on("logoLoaded", /*logoLoaded_handler*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(welcomelogo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(welcomelogo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(welcomelogo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(welcomelogo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(welcomelogo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(192:4) {#if !logoFinished}",
    		ctx
    	});

    	return block;
    }

    // (206:46) 
    function create_if_block_7(ctx) {
    	let specs;
    	let current;
    	specs = new Specs({ $$inline: true });
    	specs.$on("escPress", /*escPress_handler_2*/ ctx[18]);
    	specs.$on("command", /*execCommand*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(specs.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(specs, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(specs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(specs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(specs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(206:46) ",
    		ctx
    	});

    	return block;
    }

    // (204:46) 
    function create_if_block_6(ctx) {
    	let portfolio;
    	let current;

    	portfolio = new Portfolio({
    			props: {
    				openDir: /*openDir*/ ctx[6],
    				openFile: /*openFile*/ ctx[4],
    				fileDesc: /*fileDesc*/ ctx[5],
    				fileUrl: /*fileUrl*/ ctx[7]
    			},
    			$$inline: true
    		});

    	portfolio.$on("escPress", /*escPressed*/ ctx[8]);
    	portfolio.$on("command", /*execCommand*/ ctx[9]);
    	portfolio.$on("closeDir", /*closeDir_handler*/ ctx[16]);
    	portfolio.$on("closeFile", /*closeFile_handler_2*/ ctx[17]);

    	const block = {
    		c: function create() {
    			create_component(portfolio.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(portfolio, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const portfolio_changes = {};
    			if (dirty & /*openDir*/ 64) portfolio_changes.openDir = /*openDir*/ ctx[6];
    			if (dirty & /*openFile*/ 16) portfolio_changes.openFile = /*openFile*/ ctx[4];
    			if (dirty & /*fileDesc*/ 32) portfolio_changes.fileDesc = /*fileDesc*/ ctx[5];
    			if (dirty & /*fileUrl*/ 128) portfolio_changes.fileUrl = /*fileUrl*/ ctx[7];
    			portfolio.$set(portfolio_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(portfolio.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(portfolio.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(portfolio, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(204:46) ",
    		ctx
    	});

    	return block;
    }

    // (202:44) 
    function create_if_block_5$1(ctx) {
    	let education;
    	let current;
    	education = new Education({ $$inline: true });
    	education.$on("escPress", /*escPress_handler_1*/ ctx[15]);
    	education.$on("command", /*execCommand*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(education.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(education, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(education.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(education.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(education, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(202:44) ",
    		ctx
    	});

    	return block;
    }

    // (200:45) 
    function create_if_block_4$1(ctx) {
    	let work;
    	let current;

    	work = new Work({
    			props: { openFile: /*openFile*/ ctx[4] },
    			$$inline: true
    		});

    	work.$on("escPress", /*escPressed*/ ctx[8]);
    	work.$on("command", /*execCommand*/ ctx[9]);
    	work.$on("closeFile", /*closeFile_handler_1*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(work.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(work, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const work_changes = {};
    			if (dirty & /*openFile*/ 16) work_changes.openFile = /*openFile*/ ctx[4];
    			work.$set(work_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(work.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(work.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(work, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(200:45) ",
    		ctx
    	});

    	return block;
    }

    // (198:48) 
    function create_if_block_3$1(ctx) {
    	let modules;
    	let current;

    	modules = new Modules({
    			props: { openFile: /*openFile*/ ctx[4] },
    			$$inline: true
    		});

    	modules.$on("escPress", /*escPressed*/ ctx[8]);
    	modules.$on("command", /*execCommand*/ ctx[9]);
    	modules.$on("closeFile", /*closeFile_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(modules.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modules, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modules_changes = {};
    			if (dirty & /*openFile*/ 16) modules_changes.openFile = /*openFile*/ ctx[4];
    			modules.$set(modules_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modules.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modules.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modules, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(198:48) ",
    		ctx
    	});

    	return block;
    }

    // (196:12) {#if pageDisplay === "main"}
    function create_if_block_2$1(ctx) {
    	let welcomescreen;
    	let current;
    	welcomescreen = new WelcomeScreen({ $$inline: true });
    	welcomescreen.$on("escPress", /*escPress_handler*/ ctx[12]);
    	welcomescreen.$on("command", /*execCommand*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(welcomescreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(welcomescreen, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(welcomescreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(welcomescreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(welcomescreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(196:12) {#if pageDisplay === \\\"main\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*logoFinished*/ ctx[2]) return 0;
    		if (!/*displayConsole*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			attr_dev(section, "class", "svelte-d7nonf");
    			add_location(section, file$1, 190, 0, 7860);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(section, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let logoFinished = false;

    	//This needs to be remade more efficiently.
    	let pageDisplay = "main";

    	let openFile = "";
    	let fileDesc = "";
    	let openDir = "";
    	let fileUrl = "";
    	let { debug } = $$props;

    	if (debug) {
    		logoFinished = true;
    	}

    	let { displayConsole = false } = $$props;
    	let { consoleArray = [] } = $$props;
    	const dispatch = createEventDispatcher();

    	const commandArray = [
    		{
    			program: "main",
    			directory: undefined,
    			file: undefined,
    			altFile: undefined
    		},
    		{
    			program: "modules",
    			directory: undefined,
    			file: "langtech",
    			altFile: "langtech.sys"
    		},
    		{
    			program: "modules",
    			directory: undefined,
    			file: "webproc",
    			altFile: "webproc.sys"
    		},
    		{
    			program: "work",
    			directory: undefined,
    			file: "0",
    			altFile: undefined
    		},
    		{
    			program: "work",
    			directory: undefined,
    			file: "1",
    			altFile: undefined
    		},
    		{
    			program: "work",
    			directory: undefined,
    			file: "2",
    			altFile: undefined
    		},
    		{
    			program: "work",
    			directory: undefined,
    			file: "3",
    			altFile: undefined
    		},
    		{
    			program: "work",
    			directory: undefined,
    			file: "4",
    			altFile: undefined
    		},
    		{
    			program: "edu",
    			directory: undefined,
    			file: undefined,
    			altFile: undefined
    		},
    		{
    			program: "portf",
    			directory: "personal",
    			file: "game_of_life",
    			altFile: "game_of_life.sys",
    			desc: "Implementation of the classic cellular automation first devised by John Horton Conway. Made in React.",
    			url: "https://p-sjunnestrand.github.io/game-of-life/"
    		},
    		{
    			program: "portf",
    			directory: "personal",
    			file: "gridpainter",
    			altFile: "gridpainter.sys",
    			desc: "An online co-op multiplayer game using socket.io. Work with three friends to paint a picture before the time is up. Made in vanilla JS.",
    			url: "https://fed20d-grupp8-gridpainter.herokuapp.com/"
    		},
    		{
    			program: "portf",
    			directory: "personal",
    			file: "trials_of_norns",
    			altFile: "trials_of_norns.sys",
    			desc: "A puzzle game made in vanilla JS. Test your wits and think outside the box.",
    			url: "https://p-sjunnestrand.github.io/trials-of-norns/"
    		},
    		{
    			program: "portf",
    			directory: "clients",
    			file: "forca_fighting",
    			altFile: "forca_fighting.sys",
    			desc: "Website for a martial arts club in Stockholm. Made in React",
    			url: "https://forcafighting.com/"
    		},
    		{
    			program: "specs",
    			directory: undefined,
    			file: undefined,
    			altFile: undefined
    		},
    		{
    			program: "console",
    			directory: undefined,
    			file: undefined,
    			altFile: undefined
    		}
    	];

    	const runCommandInConsole = message => {
    		$$invalidate(1, consoleArray = consoleArray.concat(message));

    		if (!displayConsole) {
    			$$invalidate(0, displayConsole = true);
    		}
    	};

    	const escPressed = () => {
    		if (openFile) {
    			$$invalidate(4, openFile = "");
    		} else {
    			$$invalidate(0, displayConsole = true);
    		}
    	};

    	const isNumeric = value => {
    		return (/^\d+$/).test(value);
    	};

    	const execCommand = event => {
    		const command = event.detail.command;
    		const argument = event.detail.argument;
    		let matchingCommand;

    		if (command === "help") {
    			runCommandInConsole("help");
    		} else if (command === "run -p") {
    			// const program = programArray.find(program => program === argument);
    			matchingCommand = commandArray.find(command => command.program === argument);

    			if (matchingCommand === undefined) {
    				runCommandInConsole(`${argument} is not a program`);
    			} else if (matchingCommand.program === "console") {
    				$$invalidate(0, displayConsole = true);
    			} else {
    				$$invalidate(0, displayConsole = false);
    				$$invalidate(3, pageDisplay = matchingCommand.program);
    			}
    		} else if (command === "sys exit") {
    			if (!argument) {
    				dispatch('logout');
    			} else {
    				runCommandInConsole(`${argument} is not a valid argument`);
    			}
    		} else if (command === "sys shutdown") {
    			if (argument === "-n") {
    				dispatch("shutdown");
    			} else if (isNumeric(argument)) {
    				dispatch('timer', { time: argument });

    				//Fix a visible timer counting down
    				runCommandInConsole(`shutting down in ${argument} seconds`);
    			} else {
    				runCommandInConsole(`${argument} is not a valid argument`);
    			}
    		} else if (command === "open -f") {
    			matchingCommand = commandArray.find(command => command.file === argument || command.altFile === argument);

    			if (matchingCommand === undefined) {
    				runCommandInConsole(`${argument} is not a file`);
    			} else {
    				$$invalidate(0, displayConsole = false);
    				$$invalidate(3, pageDisplay = matchingCommand.program);
    				$$invalidate(6, openDir = "");
    				$$invalidate(4, openFile = matchingCommand.file);
    				console.log(openFile);

    				//This needs to be remade with the object array above.
    				if (matchingCommand.desc) {
    					$$invalidate(5, fileDesc = matchingCommand.desc);
    					$$invalidate(7, fileUrl = matchingCommand.url);
    					console.log(fileDesc);
    				}
    			}
    		} else if (command === "open -d") {
    			matchingCommand = commandArray.find(command => command.directory === argument);

    			if (matchingCommand === undefined) {
    				runCommandInConsole(`${argument} is not a directory`);
    			} else {
    				$$invalidate(0, displayConsole = false);
    				$$invalidate(3, pageDisplay = matchingCommand.program);
    				$$invalidate(6, openDir = matchingCommand.directory);
    			}
    		} else if (command === "cd ..") {
    			$$invalidate(6, openDir = "");
    		} else if (command === "sys color") {
    			const reg = /^#([0-9a-f]{3}){1,2}$/i;

    			if (reg.test(argument)) {
    				dispatch('bgcolor', argument);
    			} else if (argument === "-r") {
    				const resetColor = "#6200ff";
    				dispatch('bgcolor', resetColor);
    			} else {
    				runCommandInConsole('Syntax error: argument must be valid hex code');
    			}
    		} else if (command === "sys text") {
    			const reg = /^#([0-9a-f]{3}){1,2}$/i;

    			if (reg.test(argument)) {
    				dispatch('text', argument);
    			} else if (argument === "-r") {
    				const resetText = "#ffffff";
    				dispatch('text', resetText);
    			} else {
    				runCommandInConsole('Syntax error: argument must be valid hex code');
    			}
    		} else {
    			runCommandInConsole("Invalid command");
    		}
    	};

    	const writable_props = ['debug', 'displayConsole', 'consoleArray'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_2.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	const logoLoaded_handler = () => $$invalidate(2, logoFinished = true);
    	const escPress_handler = () => $$invalidate(0, displayConsole = true);
    	const closeFile_handler = () => $$invalidate(4, openFile = "");
    	const closeFile_handler_1 = () => $$invalidate(4, openFile = "");
    	const escPress_handler_1 = () => $$invalidate(0, displayConsole = true);
    	const closeDir_handler = () => $$invalidate(6, openDir = "");
    	const closeFile_handler_2 = () => $$invalidate(4, openFile = "");
    	const escPress_handler_2 = () => $$invalidate(0, displayConsole = true);

    	$$self.$$set = $$props => {
    		if ('debug' in $$props) $$invalidate(10, debug = $$props.debug);
    		if ('displayConsole' in $$props) $$invalidate(0, displayConsole = $$props.displayConsole);
    		if ('consoleArray' in $$props) $$invalidate(1, consoleArray = $$props.consoleArray);
    	};

    	$$self.$capture_state = () => ({
    		WelcomeLogo,
    		Header,
    		WelcomeScreen,
    		Modules,
    		Work,
    		Education,
    		Portfolio,
    		Specs,
    		Console,
    		createEventDispatcher,
    		logoFinished,
    		pageDisplay,
    		openFile,
    		fileDesc,
    		openDir,
    		fileUrl,
    		debug,
    		displayConsole,
    		consoleArray,
    		dispatch,
    		commandArray,
    		runCommandInConsole,
    		escPressed,
    		isNumeric,
    		execCommand
    	});

    	$$self.$inject_state = $$props => {
    		if ('logoFinished' in $$props) $$invalidate(2, logoFinished = $$props.logoFinished);
    		if ('pageDisplay' in $$props) $$invalidate(3, pageDisplay = $$props.pageDisplay);
    		if ('openFile' in $$props) $$invalidate(4, openFile = $$props.openFile);
    		if ('fileDesc' in $$props) $$invalidate(5, fileDesc = $$props.fileDesc);
    		if ('openDir' in $$props) $$invalidate(6, openDir = $$props.openDir);
    		if ('fileUrl' in $$props) $$invalidate(7, fileUrl = $$props.fileUrl);
    		if ('debug' in $$props) $$invalidate(10, debug = $$props.debug);
    		if ('displayConsole' in $$props) $$invalidate(0, displayConsole = $$props.displayConsole);
    		if ('consoleArray' in $$props) $$invalidate(1, consoleArray = $$props.consoleArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		displayConsole,
    		consoleArray,
    		logoFinished,
    		pageDisplay,
    		openFile,
    		fileDesc,
    		openDir,
    		fileUrl,
    		escPressed,
    		execCommand,
    		debug,
    		logoLoaded_handler,
    		escPress_handler,
    		closeFile_handler,
    		closeFile_handler_1,
    		escPress_handler_1,
    		closeDir_handler,
    		closeFile_handler_2,
    		escPress_handler_2
    	];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			debug: 10,
    			displayConsole: 0,
    			consoleArray: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*debug*/ ctx[10] === undefined && !('debug' in props)) {
    			console_2.warn("<Main> was created without expected prop 'debug'");
    		}
    	}

    	get debug() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set debug(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayConsole() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayConsole(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get consoleArray() {
    		throw new Error("<Main>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set consoleArray(value) {
    		throw new Error("<Main>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.42.5 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (506:1) {#if noteVisible}
    function create_if_block_5(ctx) {
    	let div;
    	let t0;
    	let br;
    	let t1;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("user: admin");
    			br = element("br");
    			t1 = text("\n\t\t\tpassword: psw123");
    			add_location(br, file, 507, 14, 9305);
    			attr_dev(div, "class", div_class_value = "note " + (/*noteOut*/ ctx[6] ? "hinge-exit" : null) + " svelte-17ub39s");
    			add_location(div, file, 506, 2, 9207);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*playNoteExitAnimation*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*noteOut*/ 64 && div_class_value !== (div_class_value = "note " + (/*noteOut*/ ctx[6] ? "hinge-exit" : null) + " svelte-17ub39s")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(506:1) {#if noteVisible}",
    		ctx
    	});

    	return block;
    }

    // (514:3) {#if power}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_3, create_if_block_4, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*loadingFinished*/ ctx[3]) return 0;
    		if (!/*loggedIn*/ ctx[0] && !/*access*/ ctx[4]) return 1;
    		if (!/*loggedIn*/ ctx[0]) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(514:3) {#if power}",
    		ctx
    	});

    	return block;
    }

    // (526:5) {:else}
    function create_else_block_1(ctx) {
    	let main;
    	let current;

    	main = new Main({
    			props: { debug: /*debug*/ ctx[10] },
    			$$inline: true
    		});

    	main.$on("logout", /*logout_handler*/ ctx[18]);
    	main.$on("shutdown", /*shutdown*/ ctx[12]);
    	main.$on("timer", /*shutDownTimer*/ ctx[13]);
    	main.$on("bgcolor", /*bgcolor_handler*/ ctx[19]);
    	main.$on("text", /*text_handler*/ ctx[20]);

    	const block = {
    		c: function create() {
    			create_component(main.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(526:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (524:25) 
    function create_if_block_4(ctx) {
    	let loginstatus;
    	let current;

    	loginstatus = new LoginStatus({
    			props: { access: /*access*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loginstatus.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loginstatus, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const loginstatus_changes = {};
    			if (dirty & /*access*/ 16) loginstatus_changes.access = /*access*/ ctx[4];
    			loginstatus.$set(loginstatus_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loginstatus.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loginstatus.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loginstatus, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(524:25) ",
    		ctx
    	});

    	return block;
    }

    // (522:5) {#if !loggedIn && !access}
    function create_if_block_3(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });
    	login.$on("submit", /*handleSubmit*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(522:5) {#if !loggedIn && !access}",
    		ctx
    	});

    	return block;
    }

    // (515:4) {#if !loadingFinished}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (!/*isMobile*/ ctx[9]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(515:4) {#if !loadingFinished}",
    		ctx
    	});

    	return block;
    }

    // (518:5) {:else}
    function create_else_block(ctx) {
    	let starterror;
    	let current;
    	starterror = new StartError({ $$inline: true });
    	starterror.$on("errorShutDown", /*shutDownOnBootError*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(starterror.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(starterror, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(starterror.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(starterror.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(starterror, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(518:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (516:5) {#if !isMobile}
    function create_if_block_2(ctx) {
    	let loading;
    	let current;
    	loading = new Loading({ $$inline: true });
    	loading.$on("finishLoad", /*finishLoad_handler*/ ctx[16]);
    	loading.$on("mobileDetected", /*mobileDetected_handler*/ ctx[17]);

    	const block = {
    		c: function create() {
    			create_component(loading.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(516:5) {#if !isMobile}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div9;
    	let t0;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t1;
    	let div4;
    	let div2;
    	let div2_class_value;
    	let t2;
    	let div3;
    	let t3;
    	let div8;
    	let div5;
    	let div5_id_value;
    	let t4;
    	let div6;
    	let div6_id_value;
    	let t5;
    	let div7;
    	let div7_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*noteVisible*/ ctx[5] && create_if_block_5(ctx);
    	let if_block1 = /*power*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div8 = element("div");
    			div5 = element("div");
    			t4 = space();
    			div6 = element("div");
    			t5 = space();
    			div7 = element("div");
    			attr_dev(div0, "id", "screen");

    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*firstLoad*/ ctx[2]
    			? "firstLoad"
    			: /*power*/ ctx[1] ? "on" : "off") + " svelte-17ub39s"));

    			set_style(div0, "background-color", /*power*/ ctx[1] ? /*bgColor*/ ctx[7] : null);
    			set_style(div0, "color", /*textColor*/ ctx[8]);
    			add_location(div0, file, 512, 2, 9367);
    			attr_dev(div1, "id", "bevel");
    			attr_dev(div1, "class", "svelte-17ub39s");
    			add_location(div1, file, 511, 1, 9348);
    			attr_dev(div2, "id", "on-light");
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*power*/ ctx[1] ? "green" : "red") + " svelte-17ub39s"));
    			add_location(div2, file, 534, 2, 10205);
    			attr_dev(div3, "class", "button svelte-17ub39s");
    			add_location(div3, file, 536, 2, 10383);
    			attr_dev(div4, "id", "knob-plate");
    			attr_dev(div4, "class", "svelte-17ub39s");
    			add_location(div4, file, 533, 1, 10181);
    			attr_dev(div5, "id", div5_id_value = /*power*/ ctx[1] ? "slow-pulse" : null);
    			attr_dev(div5, "class", "blinking-light svelte-17ub39s");
    			add_location(div5, file, 540, 2, 10559);
    			attr_dev(div6, "id", div6_id_value = /*power*/ ctx[1] ? "fast-ticks" : null);
    			attr_dev(div6, "class", "blinking-light svelte-17ub39s");
    			add_location(div6, file, 541, 2, 10631);
    			attr_dev(div7, "id", div7_id_value = /*power*/ ctx[1] ? "green-status" : null);
    			attr_dev(div7, "class", "blinking-light svelte-17ub39s");
    			add_location(div7, file, 542, 2, 10703);
    			attr_dev(div8, "id", "led-plate");
    			attr_dev(div8, "class", "svelte-17ub39s");
    			add_location(div8, file, 539, 1, 10536);
    			attr_dev(div9, "id", "monitor");
    			attr_dev(div9, "class", "svelte-17ub39s");
    			add_location(div9, file, 504, 0, 9167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			if (if_block0) if_block0.m(div9, null);
    			append_dev(div9, t0);
    			append_dev(div9, div1);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div9, t1);
    			append_dev(div9, div4);
    			append_dev(div4, div2);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div9, t3);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div8, t4);
    			append_dev(div8, div6);
    			append_dev(div8, t5);
    			append_dev(div8, div7);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(div3, "click", /*click_handler_1*/ ctx[22], { once: true }, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*noteVisible*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div9, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*power*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*power*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*firstLoad, power*/ 6 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*firstLoad*/ ctx[2]
    			? "firstLoad"
    			: /*power*/ ctx[1] ? "on" : "off") + " svelte-17ub39s"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*power, bgColor*/ 130) {
    				set_style(div0, "background-color", /*power*/ ctx[1] ? /*bgColor*/ ctx[7] : null);
    			}

    			if (!current || dirty & /*textColor*/ 256) {
    				set_style(div0, "color", /*textColor*/ ctx[8]);
    			}

    			if (!current || dirty & /*power*/ 2 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*power*/ ctx[1] ? "green" : "red") + " svelte-17ub39s"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*power*/ 2 && div5_id_value !== (div5_id_value = /*power*/ ctx[1] ? "slow-pulse" : null)) {
    				attr_dev(div5, "id", div5_id_value);
    			}

    			if (!current || dirty & /*power*/ 2 && div6_id_value !== (div6_id_value = /*power*/ ctx[1] ? "fast-ticks" : null)) {
    				attr_dev(div6, "id", div6_id_value);
    			}

    			if (!current || dirty & /*power*/ 2 && div7_id_value !== (div7_id_value = /*power*/ ctx[1] ? "green-status" : null)) {
    				attr_dev(div7, "id", div7_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let loggedIn = false;
    	let power = false;
    	let firstLoad = true;
    	let loadingFinished = false;
    	let access = undefined;
    	let noteVisible = true;
    	let noteOut = false;
    	let bgColor = "#6200ff";
    	let textColor = "#ffffff";
    	let isMobile = false;
    	let debug = false;

    	if (debug) {
    		loggedIn = true;
    		power = true;
    		firstLoad = false;
    		loadingFinished = true;
    	}

    	const handleSubmit = e => {
    		if (e.detail.user === "admin" && e.detail.psw === "psw123") {
    			$$invalidate(4, access = "approved");
    		} else {
    			$$invalidate(4, access = "denied");
    		}

    		setTimeout(
    			() => {
    				if (access === "approved") {
    					$$invalidate(0, loggedIn = true);
    				}

    				$$invalidate(4, access = undefined);
    			},
    			1500
    		);
    	};

    	const shutdown = () => {
    		$$invalidate(0, loggedIn = false);
    		$$invalidate(3, loadingFinished = false);
    		$$invalidate(1, power = false);
    	};

    	const shutDownTimer = e => {
    		const miliseconds = parseInt(e.detail.time) * 1000;
    		console.log(miliseconds);

    		setTimeout(
    			() => {
    				$$invalidate(0, loggedIn = false);
    				$$invalidate(3, loadingFinished = false);
    				$$invalidate(1, power = false);
    			},
    			miliseconds
    		);
    	};

    	const playNoteExitAnimation = () => {
    		$$invalidate(6, noteOut = true);

    		setTimeout(
    			() => {
    				$$invalidate(5, noteVisible = false);
    			},
    			1900
    		);
    	};

    	const shutDownOnBootError = () => {
    		shutdown();
    		$$invalidate(9, isMobile = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const finishLoad_handler = () => $$invalidate(3, loadingFinished = true);
    	const mobileDetected_handler = () => $$invalidate(9, isMobile = true);
    	const logout_handler = () => $$invalidate(0, loggedIn = false);
    	const bgcolor_handler = e => $$invalidate(7, bgColor = e.detail);
    	const text_handler = e => $$invalidate(8, textColor = e.detail);
    	const click_handler = () => $$invalidate(1, power = !power);
    	const click_handler_1 = () => $$invalidate(2, firstLoad = false);

    	$$self.$capture_state = () => ({
    		Login,
    		Loading,
    		LoginStatus,
    		Main,
    		StartError,
    		loggedIn,
    		power,
    		firstLoad,
    		loadingFinished,
    		access,
    		noteVisible,
    		noteOut,
    		bgColor,
    		textColor,
    		isMobile,
    		debug,
    		handleSubmit,
    		shutdown,
    		shutDownTimer,
    		playNoteExitAnimation,
    		shutDownOnBootError
    	});

    	$$self.$inject_state = $$props => {
    		if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    		if ('power' in $$props) $$invalidate(1, power = $$props.power);
    		if ('firstLoad' in $$props) $$invalidate(2, firstLoad = $$props.firstLoad);
    		if ('loadingFinished' in $$props) $$invalidate(3, loadingFinished = $$props.loadingFinished);
    		if ('access' in $$props) $$invalidate(4, access = $$props.access);
    		if ('noteVisible' in $$props) $$invalidate(5, noteVisible = $$props.noteVisible);
    		if ('noteOut' in $$props) $$invalidate(6, noteOut = $$props.noteOut);
    		if ('bgColor' in $$props) $$invalidate(7, bgColor = $$props.bgColor);
    		if ('textColor' in $$props) $$invalidate(8, textColor = $$props.textColor);
    		if ('isMobile' in $$props) $$invalidate(9, isMobile = $$props.isMobile);
    		if ('debug' in $$props) $$invalidate(10, debug = $$props.debug);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loggedIn,
    		power,
    		firstLoad,
    		loadingFinished,
    		access,
    		noteVisible,
    		noteOut,
    		bgColor,
    		textColor,
    		isMobile,
    		debug,
    		handleSubmit,
    		shutdown,
    		shutDownTimer,
    		playNoteExitAnimation,
    		shutDownOnBootError,
    		finishLoad_handler,
    		mobileDetected_handler,
    		logout_handler,
    		bgcolor_handler,
    		text_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
